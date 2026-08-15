import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Plus, X, Mail, UserPlus } from 'lucide-react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from '../../lib/toast';
import { db } from '../../lib/firebase';
import { colors, fonts, radius, tw } from '../../lib/theme';
import type { CollectionType } from '../../lib/types';

interface CollaboratorManagerProps {
  collection: CollectionType;
  userEmail: string;
  onUpdate: () => void;
}

/** 1:1 port of app/dashboard/collections/collaborator-manager.tsx. */
export default function CollaboratorManager({
  collection,
  userEmail,
  onUpdate,
}: CollaboratorManagerProps) {
  const [email, setEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    if (email === userEmail) {
      toast.error('You are already the owner');
      return;
    }
    if (collection.collaborators?.includes(email)) {
      toast.error('Collaborator already added');
      return;
    }

    setIsAdding(true);
    try {
      const userRef = doc(db, 'users', userEmail);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const updatedCollections = userData.collections.map((c: CollectionType) => {
          if (c.name === collection.name) {
            return {
              ...c,
              collaborators: [...(c.collaborators || []), email.trim()],
            };
          }
          return c;
        });
        await updateDoc(userRef, { collections: updatedCollections });

        // Also add to the other user's sharedCollections
        const otherUserRef = doc(db, 'users', email.trim());
        const otherUserSnap = await getDoc(otherUserRef);
        if (otherUserSnap.exists()) {
          await updateDoc(otherUserRef, {
            sharedCollections: [
              ...(otherUserSnap.data().sharedCollections || []),
              { ...collection, collaborators: [...(collection.collaborators || []), email.trim()] },
            ],
          });
        }

        onUpdate();
        setEmail('');
        toast.success('Collaborator added!');
      }
    } catch (error) {
      console.error('Error adding collaborator:', error);
      toast.error('Failed to add collaborator');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (collabEmail: string) => {
    setRemoving(collabEmail);
    try {
      const userRef = doc(db, 'users', userEmail);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const updatedCollections = userData.collections.map((c: CollectionType) => {
          if (c.name === collection.name) {
            return {
              ...c,
              collaborators: (c.collaborators || []).filter((e: string) => e !== collabEmail),
            };
          }
          return c;
        });
        await updateDoc(userRef, { collections: updatedCollections });

        // Also remove from other user's sharedCollections
        const otherUserRef = doc(db, 'users', collabEmail);
        const otherUserSnap = await getDoc(otherUserRef);
        if (otherUserSnap.exists()) {
          const otherCollections = (otherUserSnap.data().sharedCollections || []).filter(
            (c: CollectionType) => c.shareToken !== collection.shareToken
          );
          await updateDoc(otherUserRef, { sharedCollections: otherCollections });
        }

        onUpdate();
        toast.success('Collaborator removed');
      }
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast.error('Failed to remove collaborator');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.addRow}>
        <View style={styles.inputWrap}>
          <Mail size={16} color={tw.neutral500} style={styles.mailIcon} />
          <Input
            placeholder="friend@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>
        <Button
          onPress={handleAdd}
          disabled={isAdding || !email.trim()}
          style={styles.addBtn}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Plus size={16} color="#000" />
          )}
        </Button>
      </View>

      <View style={{ gap: 12 }}>
        <Text style={styles.sectionLabel}>Collaborators</Text>
        {collection.collaborators && collection.collaborators.length > 0 ? (
          <View style={{ gap: 8 }}>
            {collection.collaborators.map((c) => (
              <View key={c} style={styles.collabRow}>
                <View style={styles.collabLeft}>
                  <View style={styles.collabAvatar}>
                    <Text style={styles.collabAvatarText}>{c.substring(0, 2).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.collabEmail}>{c}</Text>
                </View>
                <Pressable
                  onPress={() => handleRemove(c)}
                  disabled={removing === c}
                  style={styles.removeBtn}
                >
                  {removing === c ? (
                    <ActivityIndicator size="small" color={tw.neutral500} />
                  ) : (
                    <X size={16} color={tw.neutral500} />
                  )}
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <UserPlus size={32} color={tw.neutral700} />
            <Text style={styles.emptyText}>No collaborators yet</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 24,
    paddingVertical: 16,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
  },
  inputWrap: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  mailIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    backgroundColor: tw.neutral800,
    borderColor: tw.neutral700,
    paddingLeft: 40,
    color: '#fff',
  },
  addBtn: {
    backgroundColor: '#fff',
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: fonts.sansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: tw.neutral500,
  },
  collabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(38,38,38,0.5)',
    padding: 12,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  collabLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  collabAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tw.indigo500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collabAvatarText: {
    fontSize: 12,
    fontFamily: fonts.sansBold,
    color: '#fff',
  },
  collabEmail: {
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  removeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: tw.neutral800,
    borderRadius: radius['2xl'],
  },
  emptyText: {
    fontSize: 14,
    color: tw.neutral500,
    fontFamily: fonts.sans,
  },
});
