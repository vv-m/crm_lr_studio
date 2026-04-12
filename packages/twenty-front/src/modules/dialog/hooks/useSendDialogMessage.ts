import { useCallback, useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';

const SEND_DIALOG_MESSAGE_MUTATION = gql`
  mutation SendDialogMessage(
    $dialogId: UUID!
    $text: String
    $contentUri: String
  ) {
    sendDialogMessage(
      dialogId: $dialogId
      text: $text
      contentUri: $contentUri
    ) {
      id
      externalMessageId
      direction
      messageType
      text
      contentUri
      status
      sentAt
    }
  }
`;

type SendDialogMessageResult = {
  id: string;
  externalMessageId: string | null;
  direction: string;
  messageType: string;
  text: string | null;
  contentUri: string | null;
  status: string;
  sentAt: string;
};

type UseSendDialogMessageReturn = {
  sendMessage: (params: {
    dialogId: string;
    text?: string;
    contentUri?: string;
  }) => Promise<SendDialogMessageResult | null>;
  loading: boolean;
};

export const useSendDialogMessage = (): UseSendDialogMessageReturn => {
  const [loading, setLoading] = useState(false);
  const apolloCoreClient = useApolloCoreClient();

  const [sendDialogMessageMutation] = useMutation<{
    sendDialogMessage: SendDialogMessageResult;
  }>(SEND_DIALOG_MESSAGE_MUTATION, { client: apolloCoreClient });

  const sendMessage = useCallback(
    async (params: {
      dialogId: string;
      text?: string;
      contentUri?: string;
    }) => {
      setLoading(true);

      try {
        const result = await sendDialogMessageMutation({
          variables: {
            dialogId: params.dialogId,
            text: params.text,
            contentUri: params.contentUri,
          },
        });

        return result.data?.sendDialogMessage ?? null;
      } finally {
        setLoading(false);
      }
    },
    [sendDialogMessageMutation],
  );

  return {
    sendMessage,
    loading,
  };
};
