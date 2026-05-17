import { supabase } from './supabase';
import { Lead, Product, Task } from '@/hooks/use-store';

export const db = {
  leads: {
    async list() {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    async create(lead: Omit<Lead, 'id'>) {
      const { data, error } = await supabase
        .from('leads')
        .insert(lead)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    async update(id: string, updates: Partial<Lead>) {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },
  products: {
    async list() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  },
  team: {
    async list() {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      return data;
    },
    async create(member: any) {
      const { data, error } = await supabase
        .from('team_members')
        .insert(member)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },
  flows: {
    async list() {
      const { data, error } = await supabase
        .from('flows')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    async create(flow: any) {
      const { data, error } = await supabase
        .from('flows')
        .insert({
          name: flow.name,
          definition: flow.data
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    async update(id: string, updates: any) {
      const { data, error } = await supabase
        .from('flows')
        .update({
          name: updates.name,
          definition: updates.data
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('flows')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },
  campaigns: {
    async list() {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    async create(campaign: any) {
      const { data, error } = await supabase
        .from('campaigns')
        .insert(campaign)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    async update(id: string, updates: any) {
      const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  }
};
