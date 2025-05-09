import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, ButtonGroup, ToggleButton } from 'react-bootstrap';
import { Play, ArrowRight } from 'react-bootstrap-icons';

const MarshallEarphonePage = () => {
    const tabs = [
        'Overview',
        'Discounts',
        'Setting',
        'Analytics'
    ];

    const [selectedTab, setSelectedTab] = useState(tabs[0]);

    return (
        <Container fluid className="bg-white" style={{ maxWidth: '1500px', margin: '50px auto', padding: '10px !important', borderRadius: '15px', padding: '5px 15px' }}>
            {/* Navigation Tabs */}
            <Row className="justify-content-start w-100" style={{ padding: '10px !important', marginBottom: '8px', marginLeft: '0', marginRight: '0' }}>
                <Col md="12" className='p-0' style={{ height: '51px' }}>
                    <ButtonGroup style={{
                        boxShadow: '1px 1px 4px 0px #0000001A inset',
                        backgroundColor: '#F1F2F4'
                        , height: '100%', borderRadius: '15px'
                    }} className='w-100 '>
                        {tabs.map((tab, idx) => (
                            <ToggleButton
                                key={idx}
                                id={`tab-${idx}`}
                                type="radio"
                                variant={selectedTab === tab ? 'dark' : ''}
                                name="tab"
                                value={tab}
                                checked={selectedTab === tab}
                                onChange={(e) => setSelectedTab(e.currentTarget.value)}
                                style={selectedTab === tab
                                    ? {
                                        backgroundColor: 'black', borderColor: 'black', borderRadius: '15px', maxWidth: '200px', fontWeight: 600,
                                        fontSize: '13px',
                                        lineHeight: '1',
                                        letterSpacing: '0'
                                    }
                                    : {
                                        borderRadius: '8px', maxWidth: '200px', fontWeight: 600,
                                        fontSize: '13px',
                                        lineHeight: '1',
                                        letterSpacing: '0'
                                    }}
                                className='d-flex justify-content-center align-items-center'
                            >
                                {tab}
                            </ToggleButton>
                        ))}
                    </ButtonGroup>
                </Col>
            </Row>

            <Row style={{
                padding: '50px', boxShadow: '1px 1px 4px 0px #0000001A inset',
                backgroundColor: '#F1F2F4', borderRadius: '15px'
            }}>
                {/* Video Display */}
                <Col md={7}>
                    <Card className="border-0 h-100" style={{ background: 'transparent !important' }}>
                        <Card.Body className="p-0">
                            <div className="position-relative h-100">
                                <video
                                    className="w-100 rounded h-auto"
                                    style={{ minHeight: '100%' }}
                                    controls
                                    // poster="/api/placeholder/600/600"
                                >
                                    <source src="/videos/marshall-earphones.mp4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                                <div className="position-absolute top-50 start-50 translate-middle">
                                    <Button variant="light" className="rounded-circle p-3 opacity-75">
                                        <Play size={24} />
                                    </Button>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Side Features */}
                <Col md={5}>
                    <div className="mb-4">
                        <div className="d-flex mb-3 gap-2 flex-column">
                            <div className="bg-dark rounded-circle d-flex align-items-center justify-content-center" style={{ height: '50px', width: '50px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
                                    <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
                                </svg>
                            </div>
                            <div>
                                <h5 className="mb-1" style={{
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    letterSpacing: '0',
                                }}>Customizable</h5>
                                <p className="text-secondary mb-0" style={{
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    letterSpacing: '0',
                                    color: '#616161'
                                }}>Discount, Display style & Priority.</p>
                            </div>
                        </div>

                        <div className="d-flex mb-3 gap-2 flex-column">
                            <div className="bg-dark rounded-circle d-flex align-items-center justify-content-center" style={{ height: '50px', width: '50px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                    <line x1="8" y1="21" x2="16" y2="21"></line>
                                    <line x1="12" y1="17" x2="12" y2="21"></line>
                                </svg>
                            </div>
                            <div>
                                <h5 className="mb-1" style={{
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    letterSpacing: '0',
                                }}>Responsive</h5>
                                <p className="text-secondary mb-0" style={{
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    letterSpacing: '0',
                                    color: '#616161'
                                }}>Looks great on any device.</p>
                            </div>
                        </div>

                        <div className="d-flex mb-5 gap-2 flex-column">
                            <div className="bg-dark rounded-circle d-flex align-items-center justify-content-center" style={{ height: '50px', width: '50px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                    <path d="M13 2v7h7"></path>
                                </svg>
                            </div>
                            <div>
                                <h5 className="mb-1" style={{
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    letterSpacing: '0',
                                }}>Attention grabbing</h5>
                                <p className="text-secondary mb-0" style={{
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    letterSpacing: '0',
                                    color: '#616161'
                                }}>Keep your customers informed without disrupting their shopping.</p>
                            </div>
                        </div>

                        <Button variant="dark" className="py-3 mb-3 d-flex align-items-center justify-content-center" style={{
                            maxWidth: '220px', borderRadius: '40px', height: '45px', fontWeight: 500,
                            fontSize: '15px',
                            letterSpacing: '0'
                        }}>
                            Make your Bundle Now!
                        </Button>

                        <div>
                            <span className="text-secondary" style={{
                                fontWeight: 600,
                                fontSize: '14px',
                                letterSpacing: '0',
                                textAlign: 'center'
                            }}>Learn More about </span>
                            <a href="#" className="text-primary" style={{
                                fontWeight: 600,
                                fontSize: '14px',
                                letterSpacing: '0',
                                textAlign: 'center',
                                color: '#5169DD'
                            }}>How to create bundle?</a>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default MarshallEarphonePage;