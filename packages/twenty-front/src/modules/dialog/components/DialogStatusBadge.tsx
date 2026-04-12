import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledBadge = styled.span<{ isOpen: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  white-space: nowrap;
  background-color: ${(props) =>
    props.isOpen
      ? themeCssVariables.color.green10
      : themeCssVariables.color.gray2};
  color: ${(props) =>
    props.isOpen
      ? themeCssVariables.color.green
      : themeCssVariables.font.color.tertiary};
`;

type DialogStatusBadgeProps = {
  status: string;
};

export const DialogStatusBadge = ({ status }: DialogStatusBadgeProps) => {
  const isOpen = status === 'open';

  return (
    <StyledBadge isOpen={isOpen}>{isOpen ? 'Open' : 'Closed'}</StyledBadge>
  );
};
