import { msg } from '@lingui/core/macro';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const assertOpportunityProductQuantityIsValid = (
  quantity: unknown,
): void => {
  if (typeof quantity !== 'number' || !Number.isFinite(quantity)) {
    throw new CommonQueryRunnerException(
      'Opportunity product quantity must be a finite number',
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      {
        userFriendlyMessage: msg`Quantity must be a valid number.`,
      },
    );
  }

  if (quantity <= 0) {
    throw new CommonQueryRunnerException(
      'Opportunity product quantity must be positive',
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      {
        userFriendlyMessage: msg`Quantity must be greater than zero.`,
      },
    );
  }
};
