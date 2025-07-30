"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { Category, Command, CommandWithCategory } from '@/lib/types';
import { initialCommandData } from '@/lib/data';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';


const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const Spinner = () => (
    <div className="no-results">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
            <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
        <p>Loading data...</p>
        <style jsx>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
);


const CommandCard = ({ id, description, command, categoryName, onDelete, onUpdate }: CommandWithCategory & { onDelete: () => void; onUpdate: (updatedData: { description: string, command: string }) => Promise<boolean>; }) => {
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedFields, setEditedFields] = useState({ description, command });

    useEffect(() => {
        setEditedFields({ description, command });
    }, [description, command]);

    const handleCopy = () => {
        navigator.clipboard.writeText(command);
        setCopied(true);
    };

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editedFields.command.trim() || !editedFields.description.trim()) {
            alert('Command and description cannot be empty.');
            return;
        }
        const success = await onUpdate(editedFields);
        if (success) {
            setIsEditing(false);
        }
    };
    
    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete this command?\n\n${command}`)) {
            onDelete();
        }
    }

    if (isEditing) {
        return (
            <form onSubmit={handleSave} className="command-card editing">
                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        value={editedFields.description}
                        onChange={e => setEditedFields(prev => ({ ...prev, description: e.target.value }))}
                        autoFocus
                        rows={3}
                    />
                </div>
                <div className="form-group">
                    <label>Command</label>
                    <textarea
                        value={editedFields.command}
                        onChange={e => setEditedFields(prev => ({ ...prev, command: e.target.value }))}
                        className="command-input"
                        rows={4}
                    />
                </div>
                <div className="editing-actions">
                    <button type="submit" className="save-button">Save</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="cancel-button">Cancel</button>
                </div>
            </form>
        );
    }

    return (
        <div className="command-card">
            <div className="card-actions">
                <button onClick={() => setIsEditing(true)} className="icon-button" aria-label="Edit command"><EditIcon /></button>
                <button onClick={handleDelete} className="icon-button" aria-label="Delete command"><TrashIcon /></button>
            </div>
            <div className="card-header">
                <p>{description}</p>
                {categoryName && <span className="category-badge">{categoryName}</span>}
            </div>
            <div className="command-wrapper">
                <code>{command}</code>
                <button 
                    onClick={handleCopy} 
                    className={`copy-button ${copied ? 'copied' : ''}`}
                    aria-label={`Copy command: ${command}`}
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
        </div>
    );
};

const QuickAddCommand = ({ category, onAddCommand }: { category: Category; onAddCommand: (command: Omit<Command, 'id' | 'user_id' | 'category_id'>) => void; }) => {
    const [command, setCommand] = useState('');
    const [description, setDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateDescription = async (commandId: number) => {
        // Find the specific command that we are working on
        const commandToUpdate = commands.find(c => c.id === commandId);
        if (!commandToUpdate) return;
    
        // Set the generating state for this specific command
        setIsGenerating(prevState => ({ ...prevState, [commandId]: true }));
    
        try {
          const response = await fetch('/api/generate-description', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: commandToUpdate.command }),
          });
    
          if (!response.ok) {
            // If the API returns an error, we handle it
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate description');
          }
    
          const { description } = await response.json();
    
          // --- THIS IS THE CRITICAL FIX ---
          // 1. Update the description in the database
          const { error: updateError } = await supabase
            .from('commands')
            .update({ description: description })
            .eq('id', commandId);
    
          if (updateError) {
            throw updateError;
          }
    
          // 2. Update the state locally to reflect the change in the UI immediately
          setCommands(currentCommands =>
            currentCommands.map(cmd =>
              cmd.id === commandId ? { ...cmd, description: description } : cmd
            )
          );
          // --- END OF FIX ---
    
        } catch (error) {
          console.error("Error generating description:", error);
          if (error instanceof Error) {
            alert(`Failed to generate description: ${error.message}`);
          } else {
            alert(`An unknown error occurred.`);
          }
        } finally {
          // Turn off the generating state for this command
          setIsGenerating(prevState => ({ ...prevState, [commandId]: false }));
        }
      };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (command && description) {
            onAddCommand({ command, description });
            setCommand('');
            setDescription('');
        }
    };

    return (
        <div className="quick-add-panel">
            <h3>Add to {category.name}</h3>
            <form onSubmit={handleSubmit} className="quick-add-form">
                <div className="form-group">
                     <textarea
                        placeholder="New command (e.g., git log)"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        required
                        aria-label="New Command"
                        rows={3}
                    />
                </div>
                 <div className="form-group description-group">
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        aria-label="Command Description"
                        rows={2}
                    />
                    <button type="button" onClick={handleGenerateDescription} disabled={isGenerating || !command} className="generate-button">
                        {isGenerating ? 'Generating...' : '✨ Generate'}
                    </button>
                </div>
                <button type="submit" className="add-button">Add Command</button>
            </form>
        </div>
    );
};

type BulkCommandRow = {
    id: number;
    command: string;
    description: string;
};

const BulkAddModal = ({ isOpen, onClose, onSave, allCategories }: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (category: string, commands: Omit<Command, 'id' | 'user_id' | 'category_id'>[]) => void;
    allCategories: Category[];
}) => {
    const [rows, setRows] = useState<BulkCommandRow[]>([{ id: 1, command: '', description: '' }]);
    const [categoryName, setCategoryName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setRows([{ id: 1, command: '', description: '' }]);
            setCategoryName('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const addRow = () => {
        setRows([...rows, { id: Date.now(), command: '', description: '' }]);
    };

    const removeRow = (id: number) => {
        setRows(rows.filter(row => row.id !== id));
    };

    const updateRow = (id: number, field: 'command' | 'description', value: string) => {
        setRows(rows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
    };

    const handleSave = () => {
        const commandsToSave = rows
            .map(({ command, description }) => ({ command, description }))
            .filter(row => row.command.trim() && row.description.trim());
        if (!categoryName.trim() || commandsToSave.length === 0) {
            alert('Please select or create a category and fill out at least one command row.');
            return;
        }
        onSave(categoryName, commandsToSave);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add Multiple Commands</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="category-input">Category</label>
                        <input
                            id="category-input"
                            type="text"
                            list="category-suggestions"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            placeholder="Select or create a category"
                        />
                        <datalist id="category-suggestions">
                            {allCategories.map(cat => <option key={cat.id} value={cat.name} />)}
                        </datalist>
                    </div>

                    <div className="bulk-add-rows">
                        {rows.map((row, index) => (
                            <div key={row.id} className="bulk-add-row">
                                <textarea
                                    placeholder={`Command ${index + 1}`}
                                    value={row.command}
                                    onChange={e => updateRow(row.id, 'command', e.target.value)}
                                    rows={2}
                                />
                                <textarea
                                    placeholder="Description"
                                    value={row.description}
                                    onChange={e => updateRow(row.id, 'description', e.target.value)}
                                    rows={2}
                                />
                                <button onClick={() => removeRow(row.id)} className="remove-row-button">&minus;</button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addRow} className="add-row-button">+ Add Row</button>
                </div>
                <div className="modal-footer">
                     <p style={{fontSize: "0.9rem", color: "var(--text-muted)"}}>Import/Export functionality coming soon!</p>
                    <button onClick={handleSave} className="save-button">Save Commands</button>
                </div>
            </div>
        </div>
    );
};

const WELCOME_SEED_KEY = 'welcome-seed-shown';

export default function CommandClient({ guestCommands }: { guestCommands: Category[] }) {
  const [commands, setCommands] = useState<Category[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('dark');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const isSeeding = useRef(false);
  const hasLoadedOnce = useRef(false);
  // Track if user has ever been seeded (per user, in localStorage)
  const [hasSeeded, setHasSeeded] = useState(false);
  const SEED_DONE_KEY = 'seed-done-';

  // --- Auth and Data Loading ---

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setIsLoading(true);
        setCommands([]);
        // Check if seeding was already done for this user (in localStorage)
        const alreadySeeded = localStorage.getItem(SEED_DONE_KEY + user.id);
        // Prevent running twice (e.g. React StrictMode)
        if (hasLoadedOnce.current) {
          setIsLoading(false);
          return;
        }
        hasLoadedOnce.current = true;
        // Load categories from Supabase
        const { data: userCategories, error } = await supabase
          .from('categories')
          .select('*, commands(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        if (error) {
          setIsLoading(false);
          alert('Error loading categories. Please refresh the page.');
          return;
        }
        // If no categories and not seeded yet, seed starter categories only once
        if ((!userCategories || userCategories.length === 0) && !alreadySeeded) {
          if (!isSeeding.current) {
            isSeeding.current = true;
            await seedInitialData(user.id);
            localStorage.setItem(SEED_DONE_KEY + user.id, 'true');
            setHasSeeded(true);
            // Show welcome message only once
            if (!localStorage.getItem(WELCOME_SEED_KEY + user.id)) {
              setShowWelcome(true);
              localStorage.setItem(WELCOME_SEED_KEY + user.id, 'true');
            }
            // Reload categories after seeding
            const { data: seededCategories } = await supabase
              .from('categories')
              .select('*, commands(*)')
              .eq('user_id', user.id)
              .order('created_at', { ascending: true });
            setCommands(seededCategories || []);
            isSeeding.current = false;
          }
        } else {
          setCommands(userCategories);
        }
        setIsLoading(false);
      } else {
        setIsLoading(true);
        const savedGuestCommands = localStorage.getItem('devops-commands-guest');
        setCommands(savedGuestCommands ? JSON.parse(savedGuestCommands) : guestCommands);
        setIsLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, guestCommands]);

  // Welcome message in English
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  // Set selected category when commands load
  useEffect(() => {
    if (!selectedCategory && commands.length > 0) {
        setSelectedCategory(commands[0]);
    } else if (selectedCategory) {
        // Refresh selected category from the new commands list to get updated data
        const refreshedCategory = commands.find(c => c.id === selectedCategory.id);
        setSelectedCategory(refreshedCategory || (commands.length > 0 ? commands[0] : null));
    }
  }, [commands]);

  // Save guest data to local storage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('devops-commands-guest', JSON.stringify(commands));
    }
  }, [commands, user]);


  // Make seedInitialData idempotent: only seed if user has no categories
  const seedInitialData = async (userId: string) => {
    // Check if user already has categories
    const { data: existingCategories, error } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId);
    if (error) {
      console.error('Error checking existing categories:', error);
      return;
    }
    if (existingCategories && existingCategories.length > 0) {
      // Categories already exist – do not seed
      return;
    }
    // Only seed if there are no categories
    for (const category of initialCommandData) {
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .insert({ name: category.name, user_id: userId })
        .select()
        .single();
      if (catError || !catData) {
        console.error('Error seeding category:', catError);
        continue;
      }
      const commandsToInsert = category.commands.map(cmd => ({
        ...cmd,
        category_id: catData.id,
        user_id: userId,
      }));
      await supabase.from('commands').insert(commandsToInsert);
    }
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCommands(guestCommands);
    setSelectedCategory(guestCommands[0] || null);
  };
  
  const toggleTheme = () => {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
  };
  
  // --- CRUD Operations ---

  const handleAddCategory = async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedName = newCategoryName.trim();
      if (!trimmedName || !user) return;
      if (commands.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
          alert('A category with this name already exists.');
          return;
      }
      
      const { data, error } = await supabase
        .from('categories')
        .insert({ name: trimmedName, user_id: user.id })
        .select('*, commands(*)')
        .single();
        
      if (error || !data) {
          console.error("Error adding category:", error);
          alert('Failed to add category.');
          return;
      }
      
      const newCommands = [...commands, data];
      setCommands(newCommands);
      setNewCategoryName('');
      setSelectedCategory(data);
  };

    const handleDeleteCategory = useCallback(async (category: Category) => {
        if (!window.confirm(`Are you sure you want to delete the category "${category.name}" and all its commands? This action cannot be undone.`)) {
            return;
        }
        
        const originalCommands = [...commands];
        const newCategories = commands.filter(c => c.id !== category.id);
        setCommands(newCategories);
        if (selectedCategory?.id === category.id) {
            setSelectedCategory(newCategories.length > 0 ? newCategories[0] : null);
        }
        
        const { error } = await supabase.from('categories').delete().eq('id', category.id).eq('user_id', user?.id || '');
        
        if (error) {
            alert('Error deleting category.');
            setCommands(originalCommands); // Revert on error
        }
    }, [commands, selectedCategory, user]);
    
    const handleUpdateCategoryName = async (newName: string) => {
        if (!editingCategory) return;
        const trimmedNewName = newName.trim();
        if (!trimmedNewName || trimmedNewName === editingCategory.name) {
            setEditingCategory(null);
            return;
        }
        if (commands.some(c => c.id !== editingCategory.id && c.name.toLowerCase() === trimmedNewName.toLowerCase())) {
            alert("A category with this name already exists.");
            return;
        }
        
        const originalCommands = [...commands];
        const updatedCommands = commands.map(c => c.id === editingCategory.id ? { ...c, name: trimmedNewName } : c);
        setCommands(updatedCommands);
        setEditingCategory(null);
        
        const { error } = await supabase.from('categories').update({ name: trimmedNewName }).eq('id', editingCategory.id);
        
        if (error) {
            alert('Failed to update category name.');
            setCommands(originalCommands);
        }
    };

    const handleDeleteCommand = async (commandId: string) => {
        const originalCommands = [...commands];
        const newCommands = commands.map(c => ({
            ...c,
            commands: c.commands.filter(cmd => cmd.id !== commandId)
        }));
        setCommands(newCommands);

        const { error } = await supabase.from('commands').delete().eq('id', commandId);

        if (error) {
            console.error("Error deleting command:", error);
            alert('Failed to delete command.');
            setCommands(originalCommands);
        }
    };
    
    const handleUpdateCommand = async (commandId: string, updatedData: { description: string, command: string }): Promise<boolean> => {
        const originalCommands = [...commands];
        let success = true;
        
        const newCommands = originalCommands.map(cat => ({
            ...cat,
            commands: cat.commands.map(cmd => cmd.id === commandId ? { ...cmd, ...updatedData } : cmd)
        }));
        setCommands(newCommands);

        const { error } = await supabase.from('commands').update(updatedData).eq('id', commandId);

        if (error) {
            console.error("Error updating command:", error);
            alert('Failed to update command. Another command might already exist with the same text.');
            setCommands(originalCommands);
            success = false;
        }
        return success;
    };
  
  const handleAddCommand = async (newCommandData: Omit<Command, 'id' | 'user_id' | 'category_id'>) => {
      if (!selectedCategory || !user) return;
      if (selectedCategory.commands.some(c => c.command === newCommandData.command)) {
          alert('A command with this text already exists in this category.');
          return;
      }
      
      const { data, error } = await supabase
        .from('commands')
        .insert({ ...newCommandData, category_id: selectedCategory.id, user_id: user.id })
        .select()
        .single();
      
      if (error || !data) {
          console.error("Error adding command:", error);
          alert('Failed to add command.');
          return;
      }
      
      const newCommands = commands.map(c => c.id === selectedCategory.id ? { ...c, commands: [...c.commands, data] } : c);
      setCommands(newCommands);
  };
  
  const handleSaveBulkCommands = async (categoryName: string, newCommandsData: Omit<Command, 'id' | 'user_id' | 'category_id'>[]) => {
    if (!categoryName || newCommandsData.length === 0 || !user) return;
    setIsLoading(true);

    let category = commands.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    
    // Create category if it doesn't exist
    if (!category) {
        const { data: newCategory, error } = await supabase
            .from('categories')
            .insert({ name: categoryName, user_id: user.id })
            .select('*, commands(*)')
            .single();
        if (error || !newCategory) {
            console.error("Error creating new category for bulk add:", error);
            alert("Failed to create the new category.");
            setIsLoading(false);
            return;
        }
        category = newCategory;
    }
    
    const commandsToInsert = newCommandsData.map(cmd => ({
        ...cmd,
        category_id: category!.id,
        user_id: user.id
    }));
    
    await supabase.from('commands').insert(commandsToInsert);
    
    // Refetch all data to ensure consistency
    const { data: userCategories } = await supabase.from('categories').select('*, commands(*)').order('created_at', { ascending: true });
    setCommands(userCategories || []);
    setIsLoading(false);
  };

  const allCommandsFlat = useMemo(() => 
    commands.flatMap(category => 
        category.commands.map(command => ({
            ...command,
            categoryName: category.name,
        }))
    ), [commands]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const lowercasedQuery = searchQuery.toLowerCase();
    return allCommandsFlat.filter(cmd => 
        cmd.command.toLowerCase().includes(lowercasedQuery) ||
        cmd.description.toLowerCase().includes(lowercasedQuery) ||
        cmd.categoryName.toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery, allCommandsFlat]);

  const commandsToDisplay = searchQuery ? searchResults : (selectedCategory?.commands || []).map(cmd => ({...cmd, categoryName: selectedCategory?.name || ''}));
  const contentTitle = searchQuery ? `Search results for "${searchQuery}"` : selectedCategory?.name;

  // Spinner/Loader for full app loading (prevents guest flash)
  if (isLoading) {
    return (
      <div className="app-loading">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      {showWelcome && (
        <div className="welcome-message">Welcome! We created some starter categories for you.</div>
      )}
      <header>
        <h1>DevOps Command Center</h1>
        <div className="header-controls">
          <input 
            type="text"
            className="search-input"
            placeholder="Search all commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search all commands"
          />
          {user ? (
            <>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{user.email}</span>
                <button onClick={handleSignOut} className="header-button">Sign Out</button>
            </>
           ) : (
            <Link href="/auth/signin" className="header-button">Sign In</Link>
           )}
          <button onClick={() => setIsModalOpen(true)} className="header-button" aria-label="Add commands" disabled={!user}>Add Commands</button>
          <button onClick={toggleTheme} className="theme-toggle" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>
      <main className="app-container">
        <aside className="sidebar">
          <h2>Categories</h2>
          {!user && (
            <div style={{ padding: '0 0 1rem', borderBottom: '1px solid var(--border)', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <p>You are in Guest Mode.</p>
                <Link href="/auth/signin" style={{color: 'var(--accent)'}}>Sign in</Link> to save your data.
            </div>
           )}
          <nav>
            <ul>
              {commands.map((category) => (
                <li key={category.id} className="category-item">
                    {editingCategory?.id === category.id ? (
                        <input
                            type="text"
                            defaultValue={category.name}
                            autoFocus
                            onBlur={(e) => handleUpdateCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') e.currentTarget.blur();
                                if (e.key === 'Escape') setEditingCategory(null);
                            }}
                            className="category-edit-input"
                        />
                    ) : (
                        <>
                            <button
                                className={selectedCategory?.id === category.id && !searchQuery ? 'active' : ''}
                                onClick={() => {
                                    setSelectedCategory(category);
                                    setSearchQuery('');
                                }}
                                aria-pressed={selectedCategory?.id === category.id && !searchQuery}
                            >
                                {category.name}
                            </button>
                            {user && (
                                <div className="category-actions">
                                    <button onClick={() => setEditingCategory(category)} className="icon-button" aria-label={`Edit category ${category.name}`}><EditIcon /></button>
                                    <button onClick={() => handleDeleteCategory(category)} className="icon-button" aria-label={`Delete category ${category.name}`}><TrashIcon /></button>
                                </div>
                            )}
                        </>
                    )}
                </li>
              ))}
            </ul>
          </nav>
          {user && (
            <form onSubmit={handleAddCategory} className="add-category-form">
              <input 
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name"
                  aria-label="New category name"
              />
              <button type="submit" aria-label="Add new category">+ Add Category</button>
            </form>
          )}
        </aside>
        <section className="content-panel">
          <h2>{contentTitle || (isLoading ? 'Loading...' : 'Select a Category')}</h2>
          {/* Removed redundant Spinner here, loading is handled globally */}
          {!isLoading ? (
            <>
              {!searchQuery && selectedCategory && user && (
                <QuickAddCommand category={selectedCategory} onAddCommand={handleAddCommand} />
              )}

              {commandsToDisplay.length > 0 ? (
                <div className="command-grid">
                  {commandsToDisplay.map((cmd) => (
                    <CommandCard 
                        key={cmd.id}
                        {...cmd}
                        onDelete={() => handleDeleteCommand(cmd.id)}
                        onUpdate={(updatedData) => handleUpdateCommand(cmd.id, updatedData)}
                    />
                  ))}
                </div>
              ) : (
                <div className="no-results">
                    <p>{searchQuery ? 'No commands match your search.' : 'This category is empty. Add a command to get started!'}</p>
                </div>
              )}
            </>
          ) : null}
        </section>
      </main>
      {user && 
        <BulkAddModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveBulkCommands}
          allCategories={commands}
        />
       }
    </>
  );
};