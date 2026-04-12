import { useCallback } from 'react';
import { useApolloClient, useMutation } from '@apollo/client/react';

import { UPLOAD_FILES_FIELD_FILE } from '@/file/graphql/mutations/uploadFilesFieldFile';

type UploadedFile = {
  id: string;
  path: string;
  url: string;
};

type UseUploadDialogFileReturn = {
  uploadFile: (file: File) => Promise<UploadedFile | null>;
};

// A placeholder fieldMetadataId for dialog file uploads
const DIALOG_FILE_FIELD_METADATA_ID = 'dialog-file-upload';

export const useUploadDialogFile = (): UseUploadDialogFileReturn => {
  const apolloClient = useApolloClient();

  const [uploadFileMutation] = useMutation(UPLOAD_FILES_FIELD_FILE, {
    client: apolloClient,
  });

  const uploadFile = useCallback(
    async (file: File): Promise<UploadedFile | null> => {
      try {
        const result = await uploadFileMutation({
          variables: {
            file,
            fieldMetadataId: DIALOG_FILE_FIELD_METADATA_ID,
          },
        });

        const data = result.data?.uploadFilesFieldFile;

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
