import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabase } from '@/lib/supabase';
import { mapDbTransactionToTransaction, mapTransactionToDbTransaction } from '@/lib/supabaseMappers';
import { Transaction } from '@/types';
import { DbTransaction } from '@/types/supabase';

// GET - Read all transactions for the authenticated user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error reading transactions:', error);
      return NextResponse.json({ error: 'Failed to read transactions' }, { status: 500 });
    }

    const transactions = (data as DbTransaction[]).map(mapDbTransactionToTransaction);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error reading transactions:', error);
    return NextResponse.json({ error: 'Failed to read transactions' }, { status: 500 });
  }
}

// POST - Save all transactions (replaces entire list for the user)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactions: Transaction[] = await request.json();
    const userId = session.user.id;

    // Delete existing transactions for this user
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting existing transactions:', deleteError);
      return NextResponse.json({ error: 'Failed to save transactions' }, { status: 500 });
    }

    // Insert new transactions if there are any
    if (transactions.length > 0) {
      const transactionsForDb = transactions.map(t => mapTransactionToDbTransaction(t, userId));

      const { error: insertError } = await supabase
        .from('transactions')
        .insert(transactionsForDb);

      if (insertError) {
        console.error('Error inserting transactions:', insertError);
        return NextResponse.json({ error: 'Failed to save transactions' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving transactions:', error);
    return NextResponse.json({ error: 'Failed to save transactions' }, { status: 500 });
  }
}
