import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledInlineLabel = styled.span`
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledArtikul = styled.span`
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

export type OpportunityProductInlineLabelProps = {
  artikul?: string | null;
  name: string;
};

export const OpportunityProductInlineLabel = ({
  artikul,
  name,
}: OpportunityProductInlineLabelProps) => {
  const titleParts: string[] = [];

  if (isNonEmptyString(artikul)) {
    titleParts.push(artikul);
  }

  titleParts.push(name);

  return (
    <StyledInlineLabel title={titleParts.join(' ')}>
      {isNonEmptyString(artikul) ? (
        <>
          <StyledArtikul>{artikul}</StyledArtikul>{' '}
        </>
      ) : null}
      {name}
    </StyledInlineLabel>
  );
};
