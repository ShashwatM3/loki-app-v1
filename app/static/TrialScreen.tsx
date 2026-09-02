import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../components/ui/Button';
import { uploadImage } from '../../lib/firebaseActions';
import { colors, fonts, radius, tw, whiteAlpha, shadows } from '../../lib/theme';

/** 1:1 port of app/trial/page.tsx (image upload to Firebase Storage). */
export default function TrialScreen() {
  const insets = useSafeAreaInsets();
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    size?: number;
    type?: string;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];

    // web parity: reject non-image files (trial/page.tsx checks file.type)
    if (asset.mimeType && !asset.mimeType.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (asset.fileSize && asset.fileSize > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile({
      uri: asset.uri,
      name: asset.fileName || `image_${Date.now()}.jpg`,
      size: asset.fileSize ?? undefined,
      type: asset.mimeType ?? 'image',
    });
    setError(null);
    setUploadedUrl(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${selectedFile.name}`;
      const storagePath = `images/${fileName}`;

      const downloadUrl = await uploadImage(selectedFile.uri, storagePath, (progress) => {
        setUploadProgress(progress);
      });

      setUploadedUrl(downloadUrl);
      console.log('Image uploaded successfully:', downloadUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadedUrl(null);
    setError(null);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: insets.top + 32,
        paddingBottom: insets.bottom + 48,
      }}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Upload Image</Text>

        <View style={{ marginTop: 16 }}>
          <Text style={styles.label}>Choose an image</Text>
          <Pressable onPress={handleFileSelect} disabled={isUploading} style={styles.fileButton}>
            <View style={styles.filePill}>
              <Text style={styles.filePillText}>Choose file</Text>
            </View>
            <Text numberOfLines={1} style={styles.fileName}>
              {selectedFile ? selectedFile.name : 'No file chosen'}
            </Text>
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {selectedFile ? (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.previewLabel}>Preview</Text>
            <Image source={{ uri: selectedFile.uri }} style={styles.preview} contentFit="cover" />
          </View>
        ) : null}

        {isUploading ? (
          <View style={{ marginTop: 16 }}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Uploading…</Text>
              <Text style={styles.progressLabel}>{uploadProgress}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
          </View>
        ) : null}

        {uploadedUrl ? (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>Upload successful!</Text>
            <Text style={styles.successLink} onPress={() => Linking.openURL(uploadedUrl)}>
              View uploaded image
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button
            onPress={handleUpload}
            disabled={!selectedFile || isUploading}
            style={{ flex: 1 }}
          >
            {isUploading ? 'Uploading…' : 'Upload'}
          </Button>
          <Button variant="secondary" onPress={handleClear} disabled={isUploading} style={{ flex: 1 }}>
            Clear
          </Button>
        </View>

        {selectedFile ? (
          <View style={styles.metaBox}>
            <Text style={styles.metaText}>
              <Text style={styles.metaKey}>File:</Text> {selectedFile.name}
            </Text>
            {selectedFile.size ? (
              <Text style={styles.metaText}>
                <Text style={styles.metaKey}>Size:</Text> {(selectedFile.size / 1024).toFixed(2)} KB
              </Text>
            ) : null}
            {selectedFile.type ? (
              <Text style={styles.metaText}>
                <Text style={styles.metaKey}>Type:</Text> {selectedFile.type}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 16,
    ...shadows.sm,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.sansBold,
    letterSpacing: -0.45,
    color: colors.foreground,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filePill: {
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filePillText: {
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    color: colors.primaryForeground,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  errorBox: {
    marginTop: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(240,76,85,0.4)',
    backgroundColor: 'rgba(240,76,85,0.1)',
    padding: 12,
  },
  errorText: {
    fontSize: 14,
    color: colors.destructive,
    fontFamily: fonts.sans,
  },
  previewLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  preview: {
    height: 192,
    width: '100%',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressLabelRow: {
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  progressTrack: {
    height: 8,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: colors.muted,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  successBox: {
    marginTop: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,201,81,0.3)',
    backgroundColor: 'rgba(0,201,81,0.1)',
    padding: 12,
  },
  successTitle: {
    marginBottom: 8,
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    color: tw.green400,
  },
  successLink: {
    fontSize: 14,
    color: colors.primary,
    textDecorationLine: 'underline',
    fontFamily: fonts.sans,
  },
  actions: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 8,
  },
  metaBox: {
    marginTop: 16,
    borderRadius: radius.md,
    backgroundColor: 'rgba(16,16,18,0.5)',
    padding: 12,
    gap: 2,
  },
  metaText: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  metaKey: {
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
});
