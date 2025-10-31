import mongoose from "mongoose";
const shopifySessions = mongoose.Schema({
    id: {
        type: String,
    },
    shop: {
        type: String,
    },
    state: {
        type: String,
    },
    scope: {
        type: String,
    },
    accessToken: {
        type: String,
    },
    isOnline: {
        type: Boolean,
    },
});

const sessionModel = mongoose.model("shopify_sessions", shopifySessions);

export default sessionModel;
