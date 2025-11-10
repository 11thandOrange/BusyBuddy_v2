import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

export default function BundleDiscountNotification() {
    return (
        <div className="py-5" style={{ maxWidth: 'auto', margin: '0 auto' }}>
            <Container fluid>
                <Row className="align-items-center">
                    <Col>
                        <h3 style={{
                            fontWeight: 600,
                            fontSize: '20px',
                            marginBottom: '0'
                        }}>Bundle Discount</h3>
                        <p style={{
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#616161',
                            marginBottom: '0'
                        }}>
                            Get Noticed! Want to make sure your message doesn't get missed? Announcement Bar lets you display important alerts right at the top of your store. Whether it's a sale, promotion, or update, it's impossible to ignore!
                        </p>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-center" style={{
                        maxWidth: '300px',
                        width: '100%'
                    }}>
                        <Button
                            variant="light"
                            className="me-2"
                            style={{
                                border: '1px solid #dee2e6',
                                height: '45px',
                                fontWeight: 500,
                                fontSize: '15px',
                                maxWidth: '95px',
                                borderRadius: '15px !importnat'
                            }}
                        >
                            Discard
                        </Button>
                        <Button
                            variant="dark"
                            className="px-4"
                            style={{
                                height: '45px',
                                fontWeight: 500,
                                fontSize: '15px',
                                borderRadius: '8px !importnat'
                            }}
                        >
                            Save Changes
                        </Button>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}