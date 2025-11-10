import InactiveTabModel from "../../models/inactiveTab.model.js";
import shopify from "../../../shopify.js";
import FormData from "form-data";

// Save inactive tab settings
async function saveInactiveTabSettings(req, res) {
  try {
    const session = res.locals.shopify.session;
    const { message, startDate, endDate, imageUrl, isEnabled } = req.body;

    // Validate required fields
    if (!message) {
      return res.status(400).json({
        status: "ERROR",
        error: "Message is required",
      });
    }

    // Find existing settings or create new ones
    const settings = await InactiveTabModel.findOneAndUpdate(
      { myshopify_domain: session.shop },
      {
        message,
        startDate: startDate || null,
        endDate: endDate || null,
        imageUrl: imageUrl || null,
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      status: "SUCCESS",
      data: settings,
    });
  } catch (error) {
    console.error("Error saving inactive tab settings:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

// Get inactive tab settings
async function getInactiveTabSettings(req, res) {
  try {
    const session = res.locals.shopify.session;

    const settings = await InactiveTabModel.findOne({
      myshopify_domain: session.shop,
    });

    // Return default settings if none exist
    if (!settings) {
      return res.json({
        status: "SUCCESS",
        data: {
          message: "Don't miss out on our special offers!",
          startDate: null,
          endDate: null,
          imageUrl: null,
          isEnabled: false,
        },
      });
    }

    res.json({
      status: "SUCCESS",
      data: settings,
    });
  } catch (error) {
    console.error("Error getting inactive tab settings:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

async function uploadImageToShopify(req, res) {
  try {
    const session = res.locals.shopify.session;

    if (!req.file) {
      return res.status(400).json({
        status: "ERROR",
        error: "No image file provided",
      });
    }

    const client = new shopify.api.clients.Graphql({ session });

    // Step 1: Request a staged upload target
    const stagedUploadMutation = `mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }`;

    const stagedUploadVariables = {
      input: [
        {
          filename: req.file.originalname,
          mimeType: req.file.mimetype,
          resource: "FILE",
          httpMethod: "POST",
        },
      ],
    };

    console.log("Requesting staged upload...");

    const stagedUploadResponse = await client.query({
      data: {
        query: stagedUploadMutation,
        variables: stagedUploadVariables,
      },
    });

    if (
      stagedUploadResponse.body.errors ||
      (stagedUploadResponse.body.data.stagedUploadsCreate.userErrors &&
        stagedUploadResponse.body.data.stagedUploadsCreate.userErrors.length > 0)
    ) {
      const errors =
        stagedUploadResponse.body.errors || stagedUploadResponse.body.data.stagedUploadsCreate.userErrors;
      throw new Error(errors.map((e) => e.message).join(", "));
    }

    const stagedTarget = stagedUploadResponse.body.data.stagedUploadsCreate.stagedTargets[0];
    console.log("Staged target received:", stagedTarget.url);

    // Step 2: Upload the file to the staged target
    // Create the form data manually to ensure proper format
    const boundary = "----WebKitFormBoundary" + Math.random().toString(16).substring(2);

    let formData = "";

    // Add all parameters first
    stagedTarget.parameters.forEach((param) => {
      formData += `--${boundary}\r\n`;
      formData += `Content-Disposition: form-data; name="${param.name}"\r\n\r\n`;
      formData += `${param.value}\r\n`;
    });

    // Add the file
    formData += `--${boundary}\r\n`;
    formData += `Content-Disposition: form-data; name="file"; filename="${req.file.originalname}"\r\n`;
    formData += `Content-Type: ${req.file.mimetype}\r\n\r\n`;

    // Convert the form data string to buffer
    const formDataBuffer = Buffer.concat([
      Buffer.from(formData, "utf8"),
      req.file.buffer,
      Buffer.from(`\r\n--${boundary}--\r\n`, "utf8"),
    ]);

    console.log("Uploading file to staged target...");

    const uploadResponse = await fetch(stagedTarget.url, {
      method: "POST",
      body: formDataBuffer,
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": formDataBuffer.length.toString(),
      },
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Upload failed with response:", errorText);
      throw new Error(
        `Failed to upload file to staged target: ${uploadResponse.status} ${uploadResponse.statusText}`
      );
    }

    console.log("File uploaded successfully to staged target");

    // Step 3: Create the file record in Shopify
    const fileCreateMutation = `mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          id
          fileStatus
          alt
          createdAt
          ... on MediaImage {
            image {
              width
              height
              url
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }`;

    const fileCreateVariables = {
      files: [
        {
          alt: req.file.originalname,
          contentType: "IMAGE",
          originalSource: stagedTarget.resourceUrl,
        },
      ],
    };

    console.log("Creating file record in Shopify...");

    const fileCreateResponse = await client.query({
      data: {
        query: fileCreateMutation,
        variables: fileCreateVariables,
      },
    });

    if (
      fileCreateResponse.body.errors ||
      (fileCreateResponse.body.data.fileCreate.userErrors &&
        fileCreateResponse.body.data.fileCreate.userErrors.length > 0)
    ) {
      const errors = fileCreateResponse.body.errors || fileCreateResponse.body.data.fileCreate.userErrors;
      throw new Error(errors.map((e) => e.message).join(", "));
    }

    // Get the uploaded file URL
    const fileData = fileCreateResponse.body.data.fileCreate.files[0];
    let imageUrl;

    if (fileData.image && fileData.image.url) {
      imageUrl = fileData.image.url;
    } else {
      // If URL not available immediately, wait and try to get it
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const fileQuery = `query getFile($id: ID!) {
        node(id: $id) {
          ... on MediaImage {
            image {
              url
            }
          }
        }
      }`;

      const fileDetailsResponse = await client.query({
        data: {
          query: fileQuery,
          variables: { id: fileData.id },
        },
      });

      if (fileDetailsResponse.body.data.node && fileDetailsResponse.body.data.node.image) {
        imageUrl = fileDetailsResponse.body.data.node.image.url;
      } else {
        throw new Error("Could not retrieve image URL from Shopify");
      }
    }

    console.log("Image uploaded successfully:", imageUrl);

    res.json({
      status: "SUCCESS",
      data: {
        imageUrl,
        fileId: fileData.id,
      },
    });
  } catch (error) {
    console.error("Error uploading image to Shopify:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

export { saveInactiveTabSettings, getInactiveTabSettings, uploadImageToShopify };
