import { ImgHTMLAttributes } from 'react';
import { ReactSVG } from 'react-svg';
import styled from 'styled-components';
import { COINS, LegacyNetworkSymbol } from './coins';
import { NetworkSymbol } from '@suite-common/wallet-config';

export interface CoinLogoProps extends ImgHTMLAttributes<HTMLImageElement> {
    symbol: NetworkSymbol | LegacyNetworkSymbol;
    className?: string;
    size?: number;
    index?: number;
}

const SvgWrapper = styled.div<Omit<CoinLogoProps, 'symbol'>>`
    display: inline-block;
    width: ${({ size }) => size}px;
    height: ${({ size }) => size}px;

    div {
        width: ${({ size }) => size}px;
        height: ${({ size }) => size}px;
        line-height: ${({ size }) => size}px;
    }
`;

export const CoinLogo = ({ symbol, className, size = 32, ...rest }: CoinLogoProps) => (
    <SvgWrapper className={className} size={size} {...rest}>
        <ReactSVG
            src={COINS[symbol]}
            beforeInjection={svg => {
                svg.setAttribute('width', `${size}px`);
                svg.setAttribute('height', `${size}px`);
            }}
            loading={() => <span className="loading" />}
        />
    </SvgWrapper>
);
