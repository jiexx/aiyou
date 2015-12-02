package com.jiexx.aiyou.fsm;

import java.util.LinkedList;
import java.util.List;
import java.util.Random;

import com.jiexx.aiyou.comm.Util;

public class Card {
	public final static char back		= 0;
	public final static char east		= 1;
	public final static char west		= 2;
	public final static char south		= 3;
	public final static char north		= 4;
	public final static char zhong		= 5;
	public final static char fa			= 6;
	public final static char bai		= 7;
	
	public final static char dot1		= 8;
	public final static char dot2		= 9;
	public final static char dot3		= 10;
	public final static char dot4		= 11;
	public final static char dot5		= 12;
	public final static char dot6		= 13;
	public final static char dot7		= 14;
	public final static char dot8		= 15;
	public final static char dot9		= 16;
	
	public final static char Bamboo1	= 17;
	public final static char Bamboo2	= 18;
	public final static char Bamboo3	= 19;
	public final static char Bamboo4	= 20;
	public final static char Bamboo5	= 21;
	public final static char Bamboo6	= 22;
	public final static char Bamboo7	= 23;
	public final static char Bamboo8	= 24;
	public final static char Bamboo9	= 25;
	
	public final static char Char1		= 26;
	public final static char Char2		= 27;
	public final static char Char3		= 28;
	public final static char Char4		= 29;
	public final static char Char5		= 30;
	public final static char Char6		= 31;
	public final static char Char7		= 32;
	public final static char Char8		= 33;
	public final static char Char9		= 34;
	
	public final static int MAX			= 14;
	
	public int pos = 0;
	public int first;
	public int second;
	public void die() {
		Random rand =new Random();
		int d = rand.nextInt(6);
		int p = rand.nextInt(6);
		if( d > p ) {
			first = 0;  // first draw
			second = 1;
		}else if( d < p ){
			first = 1;
			second = 0;
		}else if ( d == p ) {
			die();
		}
	}
	
	public void dieDealDraw() {
		die();
		deal();
		
		if( holdcards == null ) {
			holdcards = new LinkedList[2];
			holdcards[0] = new LinkedList<Byte>();
			holdcards[1] = new LinkedList<Byte>();
		}else {
			holdcards[0].clear();
			holdcards[1].clear();
		}
		
		int i;
		
		for( i = 0 ; i < MAX ;  i++ ) {
			handcards[first][i] = cards[i];
		}
		
		Util.quickSort(handcards[first], 0, MAX-1);
		pos = i;
		
		for( i = 0 ; i < MAX - 1 ; i++) {
			handcards[second][i] = cards[pos+i];
		}
		
		Util.quickSort(handcards[second], 0, MAX-2);
		
		pos += i;
	}
	LinkedList<Byte> holdcards[] = null;
	public LinkedList<Byte> getHandCards(int hand) {
		Util.log("==HOLDCARDS==", holdcards[0].toString()+holdcards[1].toString());
		return holdcards[hand];
	}
	public LinkedList<Byte> getInitHandCards(int hand) {
		LinkedList<Byte> arr = holdcards[hand];
		int len = MAX-1;
		if(first == hand) {
			len = MAX;
		}
		byte[] cards = {1,1,2,2,3,3,4,4,5,5,6,6,7,8};
		for( int i = 0 ; i < len ;  i ++ ) {
			//arr.add(Byte.valueOf(handcards[hand.val()][i]) );
			arr.add(Byte.valueOf(cards[i]));
		}
		//System.arraycopy(handcards[hand.val()], 0, arr, 0, len);
		return arr;
	}
	
	public byte cards[] = { back,
			east,west,south,north,zhong,fa,bai,
			dot1,dot2,dot3,dot4,dot5,dot6,dot7,dot8,dot9,
			Bamboo1,Bamboo2,Bamboo3,Bamboo4,Bamboo5,Bamboo6,Bamboo7,Bamboo8,Bamboo9,
			Char1,Char2,Char3,Char4,Char5,Char6,Char7,Char8,Char9,
			east,west,south,north,zhong,fa,bai,
			dot1,dot2,dot3,dot4,dot5,dot6,dot7,dot8,dot9,
			Bamboo1,Bamboo2,Bamboo3,Bamboo4,Bamboo5,Bamboo6,Bamboo7,Bamboo8,Bamboo9,
			Char1,Char2,Char3,Char4,Char5,Char6,Char7,Char8,Char9,
			east,west,south,north,zhong,fa,bai,
			dot1,dot2,dot3,dot4,dot5,dot6,dot7,dot8,dot9,
			Bamboo1,Bamboo2,Bamboo3,Bamboo4,Bamboo5,Bamboo6,Bamboo7,Bamboo8,Bamboo9,
			Char1,Char2,Char3,Char4,Char5,Char6,Char7,Char8,Char9,
			east,west,south,north,zhong,fa,bai,
			dot1,dot2,dot3,dot4,dot5,dot6,dot7,dot8,dot9,
			Bamboo1,Bamboo2,Bamboo3,Bamboo4,Bamboo5,Bamboo6,Bamboo7,Bamboo8,Bamboo9,
			Char1,Char2,Char3,Char4,Char5,Char6,Char7,Char8,Char9,
	};
	
	public byte handcards[][] = new byte[2][MAX];
	
	public static boolean hu( LinkedList<Byte> handcards ){
		return handcards.size() == MAX  && ( rule1(handcards) || rule2(handcards) );
	}
	private LinkedList<Byte> copy = new LinkedList<Byte>();
	public boolean hu( LinkedList<Byte> handcards, byte disc ){
		copy.clear();
		copy.addAll(handcards);
		
		int i = 0;
		for( i = 0 ; i < copy.size() && disc > copy.get(i) ; i ++ );
		
		copy.add(i, disc);
		
		return copy.size() == MAX && ( rule1(copy) || rule2(copy) );
	}
	
	private static boolean rule1( LinkedList<Byte> handcards ) {
		int i;
		for( i = 0 ; i < handcards.size() ; i ++ ) {
			if( handcards.get(i) !=  handcards.get(i+1) )
				break;
			i++;
		}
		return i == handcards.size();
	}
	
	private static boolean rule2( LinkedList<Byte> handcards ) {
		int j = 0, k = 0;
		for( int i = 0 ; i < handcards.size(); i ++ ) {
			if( handcards.get(i) !=  handcards.get(i+1) + 1 &&  handcards.get(i+1) != handcards.get(i+2) + 2 ) {
				j ++;
				i += 2;
			}else if( handcards.get(i) ==  handcards.get(i+1) ) {
				k ++;
			}
		}
		return j == 4 && k == 1;
	}
	
	private boolean exchange(int i, int j) {
		if( i < 136 && j < 136 && i != j) {
			byte tmp = cards[i];
			cards[i] = cards[j];
			cards[j] = tmp;
			return true;
		}
		return false;
	}

	public void deal() {
		Random rand =new Random();
		for( int i = 0 ; i < 100 ;  ) {
			if( exchange(rand.nextInt(136), rand.nextInt(136)) ) 
				i++;
		}
	}
}
