import React, { useState } from 'react';
import { useDispatch, useSelector } from '@suite-hooks';
import styled from 'styled-components';

import { RECOMMENDED_SKIP_ROUNDS } from '@suite/services/coinjoin';
import { Account } from '@suite-common/wallet-types';
import { Translation, TrezorLink } from '@suite-components';
import { Error } from '@suite-components/Error';
import { Button, Card, Checkbox, Link, Note, Tooltip, variables } from '@trezor/components';
import { DATA_TOS_URL, ZKSNACKS_TERMS_URL } from '@trezor/urls';
import { startCoinjoinSession } from '@wallet-actions/coinjoinAccountActions';
import {
    selectCurrentTargetAnonymity,
    selectRoundsNeeded,
    selectRoundsFailRateBuffer,
    selectCoinjoinClient,
} from '@wallet-reducers/coinjoinReducer';
import { useCoinjoinSessionBlockers } from '@suite/hooks/coinjoin/useCoinjoinSessionBlockers';
import { getMaxRounds } from '@wallet-utils/coinjoinUtils';
import { Tile, TileProps } from './Tile';

const StyledCard = styled(Card)`
    padding: 24px;
`;

const Row = styled.div`
    display: flex;
`;

const TopRow = styled(Row)`
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    font-size: ${variables.FONT_SIZE.H3};
    justify-content: space-between;
    margin-bottom: 32px;
`;

const TopFeeRow = styled(Row)`
    justify-content: space-between;
    margin-bottom: 8px;
`;

const FeeWrapper = styled.div`
    border-bottom: 1px solid ${({ theme }) => theme.STROKE_GREY};
    border-top: 1px solid ${({ theme }) => theme.STROKE_GREY};
    margin: 24px 0;
    padding: 16px 0;
`;

const FeeHeading = styled.div`
    color: ${({ theme }) => theme.TYPE_LIGHT_GREY};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const FeeValue = styled.div`
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
`;

const Tiles = styled.div`
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(3, 1fr);
`;

const StyledCheckbox = styled(Checkbox)`
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const StyledButton = styled(Button)`
    margin: 24px auto 0 auto;

    :disabled {
        background: ${({ theme }) => theme.STROKE_GREY};
    }
`;

const tiles: TileProps[] = [
    {
        title: <Translation id="TR_COINJOIN_TILE_1_TITLE" />,
        description: <Translation id="TR_COINJOIN_TILE_1_DESCRIPTION" />,
        image: 'CLOCK',
    },
    {
        title: <Translation id="TR_COINJOIN_TILE_2_TITLE" />,
        description: <Translation id="TR_COINJOIN_TILE_2_DESCRIPTION" />,
        image: 'FIRMWARE',
    },
    {
        title: <Translation id="TR_COINJOIN_TILE_3_TITLE" />,
        description: <Translation id="TR_COINJOIN_TILE_3_DESCRIPTION" />,
        image: 'PIN_LOCKED',
    },
];

interface CoinjoinConfirmationProps {
    account: Account;
}

export const CoinjoinConfirmation = ({ account }: CoinjoinConfirmationProps) => {
    const [termsConfirmed, setTermsConfirmed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const coinjoinClient = useSelector(state => selectCoinjoinClient(state, account.key));
    const targetAnonymity = useSelector(selectCurrentTargetAnonymity);
    const roundsNeeded = useSelector(state => selectRoundsNeeded(state, account.key));
    const roundsFailRateBuffer = useSelector(selectRoundsFailRateBuffer);

    const dispatch = useDispatch();

    const { coinjoinSessionBlockedMessage, isCoinjoinSessionBlocked } = useCoinjoinSessionBlockers(
        account.key,
    );

    const anonymitySet = account.addresses?.anonymitySet;

    if (!coinjoinClient || !targetAnonymity || !anonymitySet) {
        return (
            <Error
                error={`Suite could not ${
                    coinjoinClient ? 'determine setup values' : 'connect to coordinator'
                }.`}
            />
        );
    }

    const maxRounds = getMaxRounds(roundsNeeded, roundsFailRateBuffer);

    const isDisabled = !termsConfirmed || isCoinjoinSessionBlocked;

    const getButtonTooltipMessage = () => {
        if (coinjoinSessionBlockedMessage) {
            return coinjoinSessionBlockedMessage;
        }
        if (!termsConfirmed) {
            return <Translation id="TR_CONFIRM_CONDITIONS" />;
        }
    };
    const toggleTermsConfirmation = () => setTermsConfirmed(current => !current);
    const anonymize = async () => {
        setIsLoading(true);
        await dispatch(
            startCoinjoinSession(account, {
                maxCoordinatorFeeRate: coinjoinClient.coordinationFeeRate.rate,
                maxFeePerKvbyte: coinjoinClient.maxMiningFee * 1000, // transform to kvB
                maxRounds,
                skipRounds: RECOMMENDED_SKIP_ROUNDS,
                targetAnonymity,
            }),
        );
        setIsLoading(false);
    };

    return (
        <>
            <StyledCard>
                <TopRow>
                    <Translation id="TR_COINJOIN_SETUP" />
                </TopRow>
                <Tiles>
                    {tiles.map(tile => (
                        <Tile key={tile.image} {...tile} />
                    ))}
                </Tiles>
                <FeeWrapper>
                    <TopFeeRow>
                        <FeeHeading>
                            <Translation id="TR_SERVICE_FEE" />
                        </FeeHeading>
                        <FeeValue>0.3%</FeeValue>
                    </TopFeeRow>
                    <Note>
                        <Translation id="TR_SERVICE_FEE_NOTE" />
                    </Note>
                </FeeWrapper>
                <StyledCheckbox
                    isChecked={termsConfirmed}
                    onClick={toggleTermsConfirmation}
                    data-test="@coinjoin/checkbox"
                >
                    <Translation
                        id="TR_TERMS_AND_PRIVACY_CONFIRMATION"
                        values={{
                            coordinator: chunks => (
                                <Link href={ZKSNACKS_TERMS_URL} variant="underline">
                                    {chunks}
                                </Link>
                            ),
                            trezor: chunks => (
                                <TrezorLink href={DATA_TOS_URL} variant="underline">
                                    {chunks}
                                </TrezorLink>
                            ),
                        }}
                    />
                </StyledCheckbox>
            </StyledCard>

            <Tooltip content={getButtonTooltipMessage()}>
                <StyledButton onClick={anonymize} isDisabled={isDisabled} isLoading={isLoading}>
                    <Translation id="TR_START_COINJOIN" />
                </StyledButton>
            </Tooltip>
        </>
    );
};
