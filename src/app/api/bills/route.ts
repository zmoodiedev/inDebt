import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabase } from '@/lib/supabase';
import { mapDbBillToBill, mapBillToDbBill } from '@/lib/supabaseMappers';
import { Bill } from '@/types';
import { DbBill } from '@/types/supabase';

// GET - Read all bills for the authenticated user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', session.user.id)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error reading bills:', error);
      return NextResponse.json({ error: 'Failed to read bills' }, { status: 500 });
    }

    const bills = (data as DbBill[]).map(mapDbBillToBill);
    return NextResponse.json(bills);
  } catch (error) {
    console.error('Error reading bills:', error);
    return NextResponse.json({ error: 'Failed to read bills' }, { status: 500 });
  }
}

// POST - Save all bills (replaces entire list for the user)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bills: Bill[] = await request.json();
    const userId = session.user.id;

    // Delete existing bills for this user
    const { error: deleteError } = await supabase
      .from('bills')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting existing bills:', deleteError);
      return NextResponse.json({ error: 'Failed to save bills' }, { status: 500 });
    }

    // Insert new bills if there are any
    if (bills.length > 0) {
      const billsForDb = bills.map(bill => mapBillToDbBill(bill, userId));

      const { error: insertError } = await supabase
        .from('bills')
        .insert(billsForDb);

      if (insertError) {
        console.error('Error inserting bills:', insertError);
        return NextResponse.json({ error: 'Failed to save bills' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving bills:', error);
    return NextResponse.json({ error: 'Failed to save bills' }, { status: 500 });
  }
}
