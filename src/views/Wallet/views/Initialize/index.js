import styled from 'styled-components';
import { H1 } from 'components/Heading';
import Button from 'components/Button';
import Paragraph from 'components/Paragraph';
import Content from 'views/Wallet/components/Content';
import React from 'react';
import { connect } from 'react-redux';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const Row = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100px 48px;
`;

const A = styled.a``;

const StyledParagraph = styled(Paragraph)`
    padding: 0 0 15px 0;
    text-align: center;
`;

const Initialize = () => (
    <Content>
        <Wrapper>
            <Row>
                <H1>Your device is in not initialized</H1>
                <StyledParagraph>Please use Bitcoin wallet interface to start initialization process</StyledParagraph>
                <A href="https://beta-wallet.trezor.io/">
                    <Button>Take me to the Bitcoin wallet</Button>
                </A>
            </Row>
        </Wrapper>
    </Content>
);

export default connect(null, null)(Initialize);
