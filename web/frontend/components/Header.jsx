import React, { useState } from "react";
import { ButtonGroup, ToggleButton, Container, Row, Col } from "react-bootstrap";

const Header = ({ tabs, defaultActiveTab, setActiveTab }) => {
    const [selectedTab, setSelectedTab] = useState(defaultActiveTab || tabs[0]);

    const handleTabChange = (value) => {
        setSelectedTab(value);
        setActiveTab(value); 
    };
    
    return (
        <div className="rounded pb-2 container-fluid pt-4" style={{ maxWidth: "auto", margin: "0 auto" }}>
            <Row className="justify-content-start">
                <Col md="12" className="p-0">
                    <ButtonGroup
                        style={{
                            boxShadow: "1px 1px 4px 0px #0000001A inset",
                            padding: "8px 5px",
                            borderRadius: "15px",
                            alignItems: "center",
                            display:"flex",
                            justifyContent:"space-between"
                        }}
                        className="bg-white w-100"
                    >
                        {tabs.map((tab, idx) => (
                            <ToggleButton
                                key={idx}
                                id={`tab-${idx}`}
                                type="radio"
                                variant={selectedTab === tab ? "dark" : ""}
                                name="tab"
                                value={tab}
                                checked={selectedTab === tab}
                                onChange={(e) => handleTabChange(e.currentTarget.value)} // Use the new function
                                style={
                                    selectedTab === tab
                                        ? {
                                              backgroundColor: "black",
                                              borderColor: "black",
                                              borderRadius: "15px",
                                              maxWidth: "200px",
                                              height: "45px",
                                              fontWeight: 600,
                                              fontSize: "13px",
                                              display: "inline-flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              color: "white",
                                              padding:"0px",
                                              margin:"0px"
                                          }
                                        : {
                                              maxWidth: "200px",
                                              borderRadius: "15px",
                                              fontWeight: 600,
                                              fontSize: "13px",
                                              color: "#4A4A4A",
                                              padding:"0px",
                                              margin:"0px"
                                          }
                                }
                            >
                                {tab}
                            </ToggleButton>
                        ))}
                    </ButtonGroup>
                </Col>
            </Row>
        </div>
    );
};

export default Header;
