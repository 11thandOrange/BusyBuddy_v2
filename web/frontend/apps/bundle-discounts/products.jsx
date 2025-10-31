import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Image,
  Collapse,
} from "react-bootstrap";
import Button from "../../components/Button";

export default function Products({ onClose, setSelectedProducts, selectedProducts = [], setVariantPricing }) {
  const [activeTab, setActiveTab] = useState("All Products");
  const [selectedVariants, setSelectedVariants] = useState({});
  const [expandedProducts, setExpandedProducts] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState(null);
  const [baseProducts, setBaseProducts] = useState([]); // store all products from API
  // Refs for indeterminate checkboxes
  const checkboxRefs = useRef({});

  // Filter products based on search term and active tab
  const filteredProducts = useMemo(() => {
    // 🟦 Handle "Collections" tab
    if (activeTab === "Collections") {
      if (!activeCollection) return [];
      let collectionProducts = activeCollection.products.nodes || [];

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        collectionProducts = collectionProducts.filter((p) => p.title.toLowerCase().includes(searchLower));
      }

      return collectionProducts.map((p) => ({ node: p }));
    }

    if (!products.length) return [];
    
    let filtered = products;
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(({ node }) => 
        node.title.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply tab filter (Selected Products)
    if (activeTab === "Selected Products") {
      filtered = filtered.filter(({ node }) => {
        const productVariants = selectedVariants[node.id] || {};
        // Check if any variant is selected (excluding optionInfo)
        return Object.entries(productVariants).some(([key, value]) => 
          key !== "optionInfo" && value === true
        );
      });
    }
    
    return filtered;
  }, [products, searchTerm, activeTab, selectedVariants, collections, activeCollection]);

  // Modified toggle variant function
  const handleToggleVariant = (productId, variantIndex) => {
    // Get current variant state
    const currentState = selectedVariants[productId]?.[variantIndex];

    if (variantIndex === 0) {
      // This is the main product checkbox
      // Find the product details to get all options
      const productDetails = products.find(({ node }) => node.id === productId)?.node;
      if (!productDetails) return;

      // Calculate the new checkbox state (toggled)
      const newState = !currentState;

      // Create an updated state object for this product
      const updatedVariantState = { 0: newState };

      // If checking the main checkbox, check all options
      if (newState) {
        productDetails.options.forEach((option, optIdx) => {
          option.values.forEach((_, valueIdx) => {
            updatedVariantState[`${optIdx}-${valueIdx}`] = true;
          });
        });
      } else {
        // If unchecking the main checkbox, uncheck all options
        productDetails.options.forEach((option, optIdx) => {
          option.values.forEach((_, valueIdx) => {
            updatedVariantState[`${optIdx}-${valueIdx}`] = false;
          });
        });
      }

      // Set the updated state
      setSelectedVariants(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          ...updatedVariantState,
          optionInfo: prev[productId]?.optionInfo // Preserve optionInfo if present
        }
      }));
    } else {
      // This is an option checkbox
      setSelectedVariants((prev) => {
        const existingOptions = prev[productId] || {};
        const updatedOptions = {
          ...existingOptions,
          [variantIndex]: !currentState,
        };
        
        // Get all option keys (excluding the main checkbox key "0" and "optionInfo")
        const optionKeys = Object.keys(updatedOptions)
          .filter(key => key !== "0" && key !== "optionInfo");
        
        // Find the product to count total possible options
        const productDetails = products.find(({ node }) => node.id === productId)?.node;
        let totalPossibleOptions = 0;
        
        if (productDetails) {
          // Count total number of option values across all options
          totalPossibleOptions = productDetails.options.reduce((total, option, optIdx) => {
            return total + option.values.length;
          }, 0);
        }
        
        // Only set main checkbox to true if ALL possible options are selected
        const selectedCount = optionKeys.filter(key => updatedOptions[key]).length;
        const allSelected = totalPossibleOptions > 0 && selectedCount === totalPossibleOptions;
        
        return {
          ...prev,
          [productId]: {
            ...updatedOptions,
            0: allSelected // Only checked if ALL possible values are selected
          }
        };
      });
    }
  };

  // Function to check if a product has indeterminate state
  const isIndeterminate = (productId) => {
    const variantState = selectedVariants[productId] || {};
    
    // Get all option keys (excluding the main checkbox key "0" and "optionInfo")
    const optionKeys = Object.keys(variantState).filter(key => key !== "0" && key !== "optionInfo");
    
    if (optionKeys.length === 0) return false;
    
    // Find the product to count total possible options
    const productDetails = products.find(({ node }) => node.id === productId)?.node;
    if (!productDetails) return false;
    
    // Count total number of option values across all options
    const totalPossibleOptions = productDetails.options.reduce((total, option, optIdx) => {
      return total + option.values.length;
    }, 0);
    
    // Count selected options
    const selectedCount = optionKeys.filter(key => variantState[key]).length;
    
    // Indeterminate if some (but not all) options are selected
    return selectedCount > 0 && selectedCount < totalPossibleOptions;
  };

  // Update indeterminate state
  useEffect(() => {
    Object.keys(selectedVariants).forEach(productId => {
      const checkboxRef = checkboxRefs.current[productId];
      if (checkboxRef) {
        checkboxRef.indeterminate = isIndeterminate(productId);
      }
    });
  }, [selectedVariants]);
  // useEffect(() => {
  //   if (activeTab === "All Products") {
  //     setProducts(baseProducts);
  //   } else if (activeTab === "Selected Products") {
  //     setProducts(baseProducts); // still same base for selection filter
  //   }
  // }, [activeTab]);
  const handleToggleProduct = (productId) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // Count selected products
  const getSelectedCount = () => {
    return Object.keys(selectedVariants).filter((productId) => {
      // Check if this product has at least one selected variant
      const productVariants = selectedVariants[productId] || {};
      return Object.entries(productVariants).some(([key, value]) => 
        key !== "optionInfo" && value === true
      );
    }).length;
  };

  useEffect(() => {
    getProducts();
    getCollections();
  }, []);
  useEffect(() => {
    if (activeTab === "All Products" || activeTab === "Selected Products") {
      setProducts(baseProducts);
      setActiveCollection(null);
    }
  }, [activeTab]);
  async function getProducts() {
    try {
      const response = await fetch("/api/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      console.log("Products data:", data.data.products.edges);
      const edges = data.data.products.edges || [];
      setProducts(edges);
      setBaseProducts(edges); // store original all products
    } catch (error) {
      console.log("GetProductsError", error);
    }
  }
  async function getCollections() {
    try {
      const response = await fetch("/api/products/collections", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch collections");
      const data = await response.json();
      // console.log("Products collections:", data.data.collections.nodes);
      // setCollections(data.data.collections.nodes || []);
      // const fetchedCollections = data.data.collections.nodes || [];
      // setCollections(fetchedCollections);
      // if (fetchedCollections.length > 0) {
      //   setActiveCollection(fetchedCollections[0]); // Default to first collection
      // }
      const fetched = data.data.collections.nodes || [];
      console.log("Products collections:", fetched);
      setCollections(fetched);
    } catch (error) {
      console.log("GetCollectionsError", error);
    }
  }

  // Initialize selectedVariants based on selectedProducts prop
  useEffect(() => {
    if (selectedProducts && selectedProducts.length > 0) {
      const initialSelection = {};
      
      // Process each selected product
      selectedProducts.forEach(product => {
        const productId = product.productId;
        initialSelection[productId] = initialSelection[productId] || {};
        
        // Mark product as selected (main checkbox)
        initialSelection[productId][0] = true;
        
        // Automatically expand products that are already selected
        setExpandedProducts(prev => ({
          ...prev,
          [productId]: true
        }));
        
        // Mark selected options when product details are loaded
        product.optionSelections.forEach(optionSelection => {
          // We'll need to find the corresponding option and values in the loaded products
          const optionName = optionSelection.name;
          const selectedValues = optionSelection.values;
          
          // This will be populated when products are loaded
          // We're setting up the structure to be filled later
          initialSelection[productId].optionInfo = {
            name: optionName,
            values: selectedValues
          };
        });
      });
      
      setSelectedVariants(initialSelection);
    }
  }, [selectedProducts]);

  // Match selected options to actual product data when products are loaded
  useEffect(() => {
    if (products.length > 0 && Object.keys(selectedVariants).length > 0) {
      const updatedSelection = {...selectedVariants};
      
      // Process each pre-selected product
      Object.keys(selectedVariants).forEach(productId => {
        const productData = products.find(({node}) => node.id === productId)?.node;
        const productVariants = selectedVariants[productId];
        
        if (productData && selectedProducts) {
          // Find this product in the selectedProducts array
          const selectedProduct = selectedProducts.find(p => p.productId === productId);
          
          if (selectedProduct) {
            // For each option selection in the selected product
            selectedProduct.optionSelections.forEach(optionSelection => {
              // Find the matching option in product data
              const optionIndex = productData.options.findIndex(opt => 
                opt.name === optionSelection.name
              );
              
              if (optionIndex !== -1) {
                // For each selected value in this option
                optionSelection.values.forEach(selectedValue => {
                  // Find the value index in the product data
                  const valueIndex = productData.options[optionIndex].values.findIndex(v => 
                    v === selectedValue
                  );
                  
                  if (valueIndex !== -1) {
                    // Create the key in our selection format "optIdx-valueIdx"
                    const selectionKey = `${optionIndex}-${valueIndex}`;
                    // Mark this value as selected
                    updatedSelection[productId][selectionKey] = true;
                  }
                });
              }
            });
            
            // After adding all selections, check if we should mark the main checkbox
            const productDetails = products.find(({ node }) => node.id === productId)?.node;
            if (productDetails) {
              // Count the total possible options
              const totalPossibleOptions = productDetails.options.reduce((total, option, optIdx) => {
                return total + option.values.length;
              }, 0);
              
              // Count selected options
              const optionKeys = Object.keys(updatedSelection[productId])
                .filter(key => key !== "0" && key !== "optionInfo");
              const selectedCount = optionKeys.filter(key => updatedSelection[productId][key]).length;
              
              // Mark main checkbox checked only if all options are selected
              updatedSelection[productId][0] = (selectedCount === totalPossibleOptions);
            }
          }
        }
      });
      
      setSelectedVariants(updatedSelection);
    }
  }, [products, selectedProducts]);

  const prepareSelectedProductData = () => {
    const components = [];
    
    // Go through each product
    Object.keys(selectedVariants).forEach(productId => {
      const productVariants = selectedVariants[productId];
      if (!productVariants) return;
      
      // Check if any variant is selected for this product
      const hasSelectedVariant = Object.entries(productVariants).some(([key, value]) => 
        key !== "optionInfo" && value === true
      );
      if (!hasSelectedVariant) return;
      
      // Find the product details
      const productDetails = products.find(({ node }) => node.id === productId)?.node;
      if (!productDetails) return;
      
      // Create option selections for this product
      const optionSelections = [];
      
      // First, gather all options that have at least one selected value
      const optionsWithSelections = new Set();
      
      // Check which options have selections
      productDetails.options.forEach((option, optIdx) => {
        const hasSelection = option.values.some((_, valueIdx) => {
          const selectionKey = `${optIdx}-${valueIdx}`;
          return productVariants[selectionKey];
        });
        
        if (hasSelection) {
          optionsWithSelections.add(optIdx);
        }
      });
      
      // Process all options
      productDetails.options.forEach((option, optIdx) => {
        // If no options selected and we have multiple options, assume all values are selected for this option
        const shouldSelectAll = optionsWithSelections.size > 0 && 
                               !optionsWithSelections.has(optIdx) && 
                               productDetails.options.length > 1;
        
        let selectedValues = [];
        
        if (shouldSelectAll) {
          // Select all values for this option
          selectedValues = [...option.values];
        } else {
          // Normal selection
          option.values.forEach((value, valueIdx) => {
            const selectionKey = `${optIdx}-${valueIdx}`;
            if (productVariants[selectionKey]) {
              selectedValues.push(value);
            }
          });
        }
        
        if (selectedValues.length > 0) {
          optionSelections.push({
            componentOptionId: option.id,
            name: option.name, 
            uniqueName: `${productDetails.title} ${option.name}`,
            values: selectedValues
          });
        }
      });
      
      // Skip products with no option selections
      if (optionSelections.length === 0) return;
      
      // Get product media
      const mediaUrl = productDetails?.featuredMedia?.image?.url || 
                      'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png?v=1530129292';
      
      // Create component object with additional info
      components.push({
        productId: productId,
        title: productDetails.title,
        media: mediaUrl,
        quantity: 1, // Default quantity
        optionSelections: optionSelections
      });
    });
    
    return components;
  };

  const handleAddProducts = () => {
    const bundleData = prepareSelectedProductData();
    console.log("Bundle Data:", bundleData);

    // If there's a callback to pass the data to the parent component
    if (typeof setSelectedProducts === 'function') {
      setSelectedProducts(bundleData);
    }

    // set variantPricing to the selected products
    if (typeof setVariantPricing === 'function') {
        // Proper cartesian product function that handles 1+ arrays
        function cartesianProduct(arrays) {
            if (arrays.length === 0) return [];
            if (arrays.length === 1) return arrays[0].map(value => [value]);
            
            return arrays.reduce((acc, curr) => {
            const res = [];
            acc.forEach(a => {
                curr.forEach(b => {
                res.push([...a, b]);
                });
            });
            
            return res;
            }, [[]]);
        }
        
        // Final output
        const variantTitles = [];

        bundleData.forEach(product => {
            const optionValues = product.optionSelections.map(opt => opt.values);
            const combinations = cartesianProduct(optionValues);
            const productDetails = products.find(({ node }) => node.id === product.productId)?.node;
            combinations.forEach(combo => {
                let title = combo.join(" / ");
                // Find the variant that matches this combination
                const variant = productDetails.variants.nodes.find((variant) => variant.title == title);
                variantTitles.push({ 
                    productId: product.productId,
                    title: title,
                    price: parseFloat(variant.price) || 0
                });
            });
        });
        setVariantPricing(variantTitles);
    }
    
    onClose();
  };

  // Prevent event propagation when clicking on checkbox
  const handleCheckboxClick = (e) => {
    e.stopPropagation();
  };

  return (
    <Container fluid className="bg-light p-4" style={{ minHeight: "100vh" }}>
      <Row
        className="align-items-center mb-3 p-3 bg-white rounded"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
      >
        {/* Tabs */}
        <Col md="8" className="d-flex gap-2">
          {["All Products", "Collections", "Selected Products"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded ${activeTab === tab ? "bg-dark text-white" : "bg-light text-dark"}`}
              onClick={() => setActiveTab(tab)}
              style={{ border: "none", fontWeight: "500" }}
            >
              {tab}
            </button>
          ))}
        </Col>

        {/* Search */}
        <Col md="4" className="d-flex justify-content-end">
          <div style={{ position: "relative", width: "100%" }}>
            <Form.Control
              type="text"
              placeholder="🔍 Search Products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                paddingLeft: "2rem",
                backgroundColor: "#F5F5F5",
                border: "none",
                borderRadius: "10px",
              }}
            />
          </div>
        </Col>
        {activeTab === "Collections" && collections.length > 0 && (
          <Row className="mb-3 bg-white rounded shadow-sm p-2">
            <Col className="d-flex flex-wrap gap-2 pt-2">
              {collections.map((collection) => (
                <button
                  key={collection.title}
                  className={`px-3 py-2 rounded ${
                    activeCollection?.title === collection.title ? "bg-dark text-white" : "bg-light text-dark"
                  }`}
                  // logic for select product from collection
                  // onClick={() => {
                  //   setActiveCollection(collection);
                  //   // 🟩 Replace products with this collection’s products
                  //   const newProducts = collection.products.nodes.map((p) => ({ node: p }));
                  //   setProducts(newProducts);
                  // }}
                  // logic from select product in any collection
                  onClick={() => {
                    setActiveCollection(collection);
                    // 🟩 Convert current collection's products
                    console.log("Selected Collection Products:", collection.products.nodes);
                    const newCollectionProducts = collection.products.nodes.map((p) => ({ node: p }));

                    // 🟩 Merge with existing base products (avoid duplicates)
                    setProducts((prevProducts) => {
                      const existingIds = new Set(prevProducts.map(({ node }) => node.id));
                      const merged = [
                        ...prevProducts,
                        ...newCollectionProducts.filter(({ node }) => !existingIds.has(node.id)),
                      ];
                      return merged;
                    });
                  }}
                  style={{ border: "none", fontWeight: "500" }}
                >
                  {collection.title}
                </button>
              ))}
            </Col>
          </Row>
        )}
      </Row>

      {/* Product List */}
      <div className="bg-white shadow-sm rounded">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(({ node: product }, idx) => {
            return (
              <div key={product.id} className="p-3 mb-3 rounded">
                <div className="d-flex align-items-center">
                  <div onClick={handleCheckboxClick}>
                    <Form.Check
                      type="checkbox"
                      ref={(ref) => (checkboxRefs.current[product.id] = ref)}
                      checked={selectedVariants[product.id]?.[0] || false}
                      onChange={() => handleToggleVariant(product.id, 0)}
                      className="me-2"
                      style={{
                        transform: "scale(1.3)",
                        accentColor: "black",
                      }}
                    />
                  </div>
                  <div
                    className="d-flex align-items-center flex-grow-1"
                    onClick={() => handleToggleProduct(product.id)}
                  >
                    <Image
                      src={
                        product?.featuredMedia?.image?.url ||
                        "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png?v=1530129292"
                      }
                      width={80}
                      height={80}
                      className="me-3 rounded img-fluid"
                    />
                    <div className="flex-grow-1">
                      <div>{product.title}</div>
                    </div>
                  </div>
                </div>

                <Collapse in={expandedProducts[product.id]}>
                  <div className="mt-3">
                    {/* Display each option separately */}
                    {product.options.map((option, optIdx) => {
                      // Find matching option in selectedProducts
                      const selectedProduct = selectedProducts.find((p) => p.productId === product.id);
                      const selectedOption = selectedProduct?.optionSelections.find(
                        (o) => o.name === option.name
                      );

                      return (
                        <div key={optIdx} className="mb-3">
                          <div className="fw-bold mb-2" style={{ paddingLeft: "80px" }}>
                            {option.name}
                          </div>

                          {/* Display individual values for each option */}
                          {option.values.map((value, valueIdx) => {
                            // Check if this specific value is selected in selectedProducts
                            const isValueSelected = selectedOption?.values.includes(value);
                            const variantIndex = `${optIdx}-${valueIdx}`;

                            return (
                              <div
                                key={valueIdx}
                                className="d-flex align-items-center"
                                style={{
                                  border: "1px solid lightgrey",
                                  padding: "10px 100px",
                                  borderWidth: valueIdx === option.values.length - 1 ? "1px 0" : "1px 0 0 0",
                                }}
                              >
                                <Form.Check
                                  type="checkbox"
                                  checked={selectedVariants[product.id]?.[variantIndex] || false}
                                  onChange={() => handleToggleVariant(product.id, variantIndex)}
                                  className="me-2"
                                  style={{
                                    transform: "scale(1.3)",
                                    accentColor: "black",
                                  }}
                                />
                                <div className="fw-bold">{value}</div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </Collapse>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-muted">
            {activeTab === "Selected Products"
              ? "No products selected"
              : searchTerm
                ? `No products found for "${searchTerm}"`
                : "No products available"}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="d-flex justify-content-between align-items-center bg-dark text-white px-4 py-3"
        style={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <div>{getSelectedCount()} Products Selected</div>
        <div className="d-flex gap-2">
          <Button
            text="Cancel"
            onClick={onClose}
            style={{
              backgroundColor: "white",
              color: "#5169DD",
              borderRadius: "10px",
              padding: "7px 10px 7px 7px",
            }}
          />
          <Button
            text="Add"
            onClick={handleAddProducts}
            style={{
              backgroundColor: "white",
              color: "#5169DD",
              border: "1px solid #5169DD",
              borderRadius: "10px",
              padding: "7px 10px 7px 7px",
            }}
          />
        </div>
      </div>
    </Container>
  );
}
