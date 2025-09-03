import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const API_BASE_URL = 'https://note-api-osvu.onrender.com/api';

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function NotesScreen({ onLogout }: { onLogout: () => void }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/notes`);
      setNotes(response.data);
    } catch {
      Alert.alert('Error', 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setNoteTitle(note.title);
      setNoteContent(note.content);
    } else {
      setEditingNote(null);
      setNoteTitle('');
      setNoteContent('');
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
  };

  const saveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    try {
      setLoading(true);
      
      if (editingNote) {
        await axios.put(`${API_BASE_URL}/notes/${editingNote.id}`, {
          title: noteTitle,
          content: noteContent,
        });

        const updatedNotes = notes.map(note =>
          note.id === editingNote.id
            ? { ...note, title: noteTitle, content: noteContent }
            : note
        );
        setNotes(updatedNotes);
      } else {
        const response = await axios.post(`${API_BASE_URL}/notes`, {
          title: noteTitle,
          content: noteContent,
        });

        const newNote: Note = {
          id: response.data.id || Date.now().toString(),
          title: noteTitle,
          content: noteContent,
          createdAt: new Date().toISOString(),
        };
        setNotes([newNote, ...notes]);
      }
      
      closeModal();
    } catch {
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (note: Note) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await axios.delete(`${API_BASE_URL}/notes/${note.id}`);
              setNotes(notes.filter(n => n.id !== note.id));
            } catch {
              Alert.alert('Error', 'Failed to delete note');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={styles.noteItem}
      onPress={() => openModal(item)}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteNote(item)}>
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
      <Text style={styles.noteContent} numberOfLines={2}>{item.content}</Text>
      <Text style={styles.noteDate}>{formatDate(item.createdAt)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Notes</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={[styles.addButton, { marginRight: 10 }]} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notes List */}
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderNoteItem}
        contentContainerStyle={styles.notesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No notes yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to create your first note</Text>
          </View>
        }
      />

      {/* Add/Edit Note Modal */}
      <Modal animationType="slide" transparent={false} visible={modalVisible} onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingNote ? 'Edit Note' : 'New Note'}</Text>
            <TouchableOpacity onPress={saveNote} disabled={loading}>
              <Text style={[styles.saveButtonText, loading && styles.disabledText]}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.titleInput}
              placeholder="Note title..."
              value={noteTitle}
              onChangeText={setNoteTitle}
              maxLength={100}
            />
            <TextInput
              style={styles.contentInput}
              placeholder="Write your note here..."
              value={noteContent}
              onChangeText={setNoteContent}
              multiline
              textAlignVertical="top"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  addButton: {
    backgroundColor: '#007AFF', width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  notesList: { padding: 20 },
  noteItem: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  noteTitle: { fontSize: 18, fontWeight: '600', color: '#333', flex: 1, marginRight: 10 },
  deleteButton: { padding: 4 },
  noteContent: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 8 },
  noteDate: { fontSize: 12, color: '#999' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 20, fontWeight: '600', color: '#999', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#ccc', marginTop: 8 },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#007AFF' },
  disabledText: { opacity: 0.5 },
  modalContent: { flex: 1, padding: 20 },
  titleInput: {
    fontSize: 20, fontWeight: '600', color: '#333',
    borderBottomWidth: 1, borderBottomColor: '#eee',
    paddingVertical: 12, marginBottom: 20,
  },
  contentInput: { flex: 1, fontSize: 16, color: '#333', lineHeight: 24 },
});
