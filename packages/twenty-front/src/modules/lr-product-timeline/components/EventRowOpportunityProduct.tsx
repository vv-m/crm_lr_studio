import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowItem } from '@/activities/timeline-activities/rows/components/EventRowItem';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledEventRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledRowContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  overflow: hidden;
`;

const StyledItemTitleDate = styled.div`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
  color: ${themeCssVariables.font.color.tertiary};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledProductName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

const getActionLabel = (action: string): string => {
  switch (action) {
    case 'created':
      return t`добавил(а) товар`;
    case 'deleted':
    case 'destroyed':
      return t`удалил(а) товар`;
    case 'restored':
      return t`восстановил(а) товар`;
    default:
      return action;
  }
};

type EventRowOpportunityProductProps = EventRowDynamicComponentProps;

export const EventRowOpportunityProduct = ({
  event,
  authorFullName,
  createdAt,
}: EventRowOpportunityProductProps) => {
  const [, eventAction] = event.name.split('.');

  const productName = event.linkedRecordCachedName ?? t`Без названия`;

  return (
    <StyledEventRow>
      <StyledRowContainer>
        <StyledRow>
          <EventRowItem>{authorFullName}</EventRowItem>
          <EventRowItem variant="action">
            {getActionLabel(eventAction)}
          </EventRowItem>
          <StyledProductName>
            <OverflowingTextWithTooltip text={productName} />
          </StyledProductName>
        </StyledRow>
        <StyledItemTitleDate>{createdAt}</StyledItemTitleDate>
      </StyledRowContainer>
    </StyledEventRow>
  );
};
