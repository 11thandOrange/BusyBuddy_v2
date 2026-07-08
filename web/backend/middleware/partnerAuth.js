import referralModel from "../models/referral.model.js";

/**
 * Partner authentication middleware for referral financial data.
 * The referral `code` is public (embedded in shareable links), so it cannot
 * be used as a credential. This validates a separate `partner_token` secret,
 * passed via the `x-referral-token` header, against the referral identified
 * by the `:code` route param.
 */
export const partnerAuth = async (req, res, next) => {
  const { code } = req.params;
  const token = req.headers["x-referral-token"];

  if (!token) {
    return res.status(401).json({
      status: "ERROR",
      error: "Unauthorized - Missing partner token",
    });
  }

  try {
    const referral = await referralModel
      .findOne({ code })
      .select("+partner_token");

    if (!referral || !referral.partner_token || referral.partner_token !== token) {
      return res.status(401).json({
        status: "ERROR",
        error: "Unauthorized - Invalid partner token",
      });
    }

    next();
  } catch (error) {
    console.error("partnerAuth error:", error);
    return res.status(500).json({
      status: "ERROR",
      error: "Server error during authentication",
    });
  }
};

export default { partnerAuth };
