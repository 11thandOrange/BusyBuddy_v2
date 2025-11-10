import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, ListGroup, Badge } from "react-bootstrap";
// import DiscountModal from "./DiscountModal";
import DiscountModal from "../components/Modals/GlobalDisountModal";
export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setProducts(data.data.products.edges);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  useEffect(() => {
    getProducts();
  }, []);

  if (loading) {
    return <div className="text-center py-5">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center py-5 text-danger">Error: {error}</div>;
  }

  if (!products.length) {
    return <div className="text-center py-5">No products found</div>;
  }
  console.log("Products======>>>", products);

  const AddProductBundel = async() => { 
    const response = await fetch("/api/bundles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }); 
    const data = await response.json(); 
    console.log("Data------", data); 
    return data;
  };

  // useEffect(() => {
  //   getProductsV2().then((data) => {
  //     console.log("products getProductsV2", data);
  //   });
  // }, []);
  return (
    <Container className="py-4">
      <h1 className="mb-4">Product List</h1>

      <Row xs={1} md={2} lg={3} className="g-4">
        {products.map(({ node: product }) => (
          <Col key={product.id}>
            <Card className="h-100">
              {/* Product Image */}
              {product.featuredMedia && product.featuredMedia.image.url && (
                <Card.Img
                  variant="top"
                  src={product.featuredMedia.image.url}
                  alt={product.title}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              )}

              <Card.Body>
                <Card.Title>{product.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  Product ID: {product.id.split("/").pop()}
                </Card.Subtitle>

                {/* Variants list */}
                {product.options && product.options.length > 0 && (
                  <>
                    <h6 className="mt-3">Variants:</h6>
                    <ListGroup variant="flush">
                      {product.options.map((variant) => (
                        <ListGroup.Item key={variant.id}>
                          <div className="d-flex justify-content-between">
                            <span>{variant?.name}</span>
                            <Badge bg="secondary">{variant?.values}</Badge>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </>
                )}
                <button onClick={AddProductBundel}>ADD BUNDEL</button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
