import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import PropertyPanel from './components/PropertyPanel';
import { useStore } from './store';

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedIds, copy, paste, deleteComponent, undo, redo } = useStore();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedIds.length > 0) {
        if (confirm(`删除 ${selectedIds.length} 个组件？`)) {
          selectedIds.forEach(id => deleteComponent(id));
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedIds.length > 0) {
        e.preventDefault();
        copy();
        alert(`✅ 已复制 ${selectedIds.length} 个组件`);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        paste();
      }

      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIds, copy, paste, deleteComponent, undo, redo]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
        <Sidebar />
        <Canvas />
        <PropertyPanel fileInputRef={fileInputRef} />
      </div>
    </DndProvider>
  );
}

export default App;