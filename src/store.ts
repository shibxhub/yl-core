import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { PageComponent, PageMeta } from './types';

interface Store {
  components: PageComponent[];
  selectedIds: string[];
  history: PageComponent[][];
  historyIndex: number;
  meta: PageMeta;
  copiedComponents: PageComponent[];

  addComponent: (comp: Omit<PageComponent, 'id'>) => void;
  updateComponent: (id: string, props: Partial<PageComponent>) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  setComponents: (components: PageComponent[]) => void;
  updateMeta: (meta: Partial<PageMeta>) => void;
  copy: () => void;
  paste: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveToHistory: () => void;
}

export const useStore = create<Store>()(
  devtools(
    persist(
      (set, get) => ({
        components: [],
        selectedIds: [],
        history: [],
        historyIndex: -1,
        meta: { title: '未命名页面', description: '' },
        copiedComponents: [],

        saveToHistory: () => {
          const { components } = get();
          const history = [...get().history.slice(0, get().historyIndex + 1), JSON.parse(JSON.stringify(components))];
          set({ history, historyIndex: history.length - 1 });
        },

        undo: () => {
          const { history, historyIndex } = get();
          if (historyIndex > 0) {
            set({ components: JSON.parse(JSON.stringify(history[historyIndex - 1])), historyIndex: historyIndex - 1 });
            get().saveToHistory();
          }
        },

        redo: () => {
          const { history, historyIndex } = get();
          if (historyIndex < history.length - 1) {
            set({ components: JSON.parse(JSON.stringify(history[historyIndex + 1])), historyIndex: historyIndex + 1 });
            get().saveToHistory();
          }
        },

        canUndo: () => get().historyIndex > 0,
        canRedo: () => get().historyIndex < get().history.length - 1,

        addComponent: (comp) => {
          const id = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          set((state) => ({ components: [...state.components, { ...comp, id }] }));
          get().saveToHistory();
        },

        updateComponent: (id, props) => {
          set((state) => ({
            components: state.components.map((c) => (c.id === id ? { ...c, ...props } : c)),
          }));
          get().saveToHistory();
        },

        deleteComponent: (id) => {
          set((state) => ({
            components: state.components.filter((c) => c.id !== id),
            selectedIds: state.selectedIds.filter((sid) => sid !== id),
          }));
          get().saveToHistory();
        },

        selectComponent: (id, multi = false) => {
          set((state) => {
            const selectedIds = multi
              ? state.selectedIds.includes(id)
                ? state.selectedIds.filter((sid) => sid !== id)
                : [...state.selectedIds, id]
              : [id];
            return { selectedIds };
          });
        },

        clearSelection: () => set({ selectedIds: [] }),

        setComponents: (components) => {
          set({ components });
          get().saveToHistory();
        },

        updateMeta: (meta) => set((state) => ({ meta: { ...state.meta, ...meta } })),

        copy: () => {
          const { selectedIds, components } = get();
          set({
            copiedComponents: selectedIds
              .map(id => components.find(c => c.id === id))
              .filter((c): c is PageComponent => !!c)
          });
        },

        paste: () => {
          const { copiedComponents, addComponent } = get();
          const offset = 20;
          copiedComponents.forEach(comp => {
            addComponent({
              type: comp.type,
              props: { ...comp.props },
              position: { x: comp.position.x + offset, y: comp.position.y + offset },
              size: comp.size ? { ...comp.size } : undefined,
            });
          });
        },
      }),
      { name: 'yl-core-store' }
    )
  )
);