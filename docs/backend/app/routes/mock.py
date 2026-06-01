from fastapi import APIRouter
router = APIRouter()

@router.get("/bundles")
async def mock_bundles():
    return {"success": True, "data": [
        {"_id": "64a1b2c3", "shop": "demo.myshopify.com", "name": "Buy 2 Get 1", "isActive": True}
    ]}
