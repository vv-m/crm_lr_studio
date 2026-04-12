import { useCallback } from 'react';
import { useApolloClient, useMutation } from '@apollo/client/react';

import { UploadAiChatFileDocument } from '~/generated-metadata/graphql';

type UploadedFile = {
  id: string;
  path: string;
  url: string;
};

type UseUploadDialogFileReturn = {
  uploadFile: (file: File) => Promise<UploadedFile | null>;
};

// Reuse the AI chat file upload mutation — it accepts a bare file
// without requiring a fieldMetadataId UUID
export const useUploadDialogFile = (): UseUploadDialogFileReturn => {
  const apolloClient = useApolloClient();

  const [uploadFileMutation] = useMutation(UploadAiChatFileDocument, {
    client: apolloClient,
  });

  const uploadFile = useCallback(
    async (file: File): Promise<UploadedFile | null> => {
      try {
        const result = await uploadFileMutation({
          variables: { file },
        });

        const data = result.data?.uploadAIChatFile;

        if (!data) {
          return null;
        }

        return {
          id: data.id,
          path: data.path,
          url: data.url,
        };
      } catch (error) {
        console.error('Failed to upload dialog file:', error);

        return null;
      }
    },
    [uploadFileMutation],
  );

  return { uploadFile };
};
