/**
 * Componente de Reproductor de Video
 * Muestra videos de evidencias con controles nativos
 * 
 * @module presentation/visits/components/VideoPlayer
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import { useThemeColor } from '@/presentation/theme/hooks/useThemeColor';

interface VideoPlayerProps {
  uri: string;
  onClose?: () => void;
  visible?: boolean;
}

/**
 * Reproductor de video con controles nativos
 * Soporta fullscreen, play/pause, y muestra estado de carga
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  uri,
  onClose,
  visible = true,
}) => {
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  
  const videoRef = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setIsPlaying(status.isPlaying);
    } else if (status.error) {
      setIsLoading(false);
      setError('Error al cargar el video');
      console.error('Video error:', status.error);
    }
  };

  const handlePlayPause = async () => {
    if (!videoRef.current) return;
    
    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    } catch (err) {
      console.error('Error controlling video:', err);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Close Button */}
        <Pressable
          style={styles.closeButton}
          onPress={onClose}
        >
          <Ionicons name="close" size={32} color="#FFFFFF" />
        </Pressable>

        {/* Video Container */}
        <View style={styles.videoContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#FF3B30" />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
              <Pressable
                onPress={onClose}
                style={[styles.errorButton, { borderColor: '#FFFFFF' }]}
              >
                <ThemedText style={styles.errorButtonText}>Cerrar</ThemedText>
              </Pressable>
            </View>
          ) : (
            <>
              <Video
                ref={videoRef}
                source={{ uri }}
                style={styles.video}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                shouldPlay={false}
              />

              {/* Loading Indicator */}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={primaryColor} />
                  <ThemedText style={styles.loadingText}>Cargando video...</ThemedText>
                </View>
              )}

              {/* Custom Play/Pause Button (optional - video has native controls) */}
              {!isLoading && !isPlaying && (
                <Pressable
                  style={styles.playButtonOverlay}
                  onPress={handlePlayPause}
                >
                  <View style={[styles.playButton, { backgroundColor: primaryColor }]}>
                    <Ionicons name="play" size={48} color="#FFFFFF" />
                  </View>
                </Pressable>
              )}
            </>
          )}
        </View>

        {/* Video Info */}
        {!error && (
          <View style={styles.infoContainer}>
            <ThemedText style={styles.infoText}>
              Toca el video para ver los controles
            </ThemedText>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  videoContainer: {
    width: '100%',
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
  },
  playButtonOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 20,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default VideoPlayer;

