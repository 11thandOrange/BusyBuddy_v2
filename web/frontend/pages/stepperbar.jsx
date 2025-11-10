import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

export default function ProductStepper() {
    const [currentStep, setCurrentStep] = useState(1);

    const steps = [
        { id: '01', name: 'Select Products', active: true },
        { id: '02', name: 'Discount Settings', active: false },
        { id: '03', name: 'Bundle Settings', active: false },
        { id: '04', name: 'Display Settings', active: false },
        { id: '05', name: 'Review Settings', active: false }
    ];

    const handleContinue = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    return (
        <Container fluid className="py-3">
            {/* Stepper Component */}
            <Row className="align-items-center mb-4">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        {/* Step Circle */}
                        <Col xs="auto" className="px-0">
                            <div
                                className="d-flex align-items-center justify-content-center rounded-circle"
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    backgroundColor: index < currentStep ? '#212529' : index === currentStep ? '#212529' : '#F8F9FA',
                                    border: '1px solid #DEE2E6',
                                    color: index <= currentStep ? 'white' : '#6C757D',
                                    fontSize: '12px',
                                    fontWeight: 500
                                }}
                            >
                                {step.id}
                            </div>
                        </Col>

                        {/* Step Name */}
                        <Col>
                            <span
                                style={{
                                    fontSize: '14px',
                                    fontWeight: index <= currentStep ? 600 : 400,
                                    color: index <= currentStep ? '#212529' : '#6C757D'
                                }}
                            >
                                {step.name}
                            </span>
                        </Col>

                        {/* Connector Line (except after last item) */}
                        {index < steps.length - 1 && (
                            <Col xs="auto" className="px-0">
                                <div
                                    style={{
                                        height: '1px',
                                        width: '16px',
                                        backgroundColor: '#DEE2E6'
                                    }}
                                ></div>
                            </Col>
                        )}
                    </React.Fragment>
                ))}
            </Row>

            {/* Content Area - This would contain your step content */}
            <div className="bg-light p-4 rounded mb-3" style={{ minHeight: '200px' }}>
                <h4>Step {currentStep}: {steps[currentStep - 1].name}</h4>
                <p>Content for this step would go here.</p>
            </div>

            {/* Continue Button */}
            <div className="d-flex justify-content-end">
                <Button
                    variant="primary"
                    onClick={handleContinue}
                    disabled={currentStep === steps.length}
                >
                    Continue
                </Button>
            </div>
        </Container>
    );
}