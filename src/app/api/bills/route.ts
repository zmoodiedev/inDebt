import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabase } from '@/lib/supabase';
import { mapDbBillToBill, mapBillToDbBill } from '@/lib/supabaseMappers';
import { Bill } from '@/types';
import { DbBill } from '@/types/supabase';

// GET - Read all bills for the authenticated user's household
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.householdId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('household_id', session.user.householdId)
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

// POST - Create a single new bill
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.householdId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bill: Bill = await request.json();
    const userId = session.user.id;
    const householdId = session.user.householdId;

    const billForDb = mapBillToDbBill(bill, userId, householdId);

    const { data, error } = await supabase
      .from('bills')
      .insert(billForDb)
      .select()
      .single();

    if (error) {
      console.error('Error creating bill:', error);
      return NextResponse.json({ error: 'Failed to create bill', details: error.message }, { status: 500 });
    }

    return NextResponse.json(mapDbBillToBill(data as DbBill));
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
  }
}
