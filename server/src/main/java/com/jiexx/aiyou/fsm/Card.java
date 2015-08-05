package com.jiexx.aiyou.fsm;

import java.util.LinkedList;
import java.util.List;
import java.util.Random;

import com.jiexx.aiyou.comm.Util;
import com.jiexx.aiyou.service.Round;

public class Card {	
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
	public Round.Hand first;
	public void die() {
		Random rand =new Random();
		int d = rand.nextInt(6);
		int p = rand.nextInt(6);
		if( d > p ) {
			first = Round.Hand.DEALER;  // first draw
		}else if( d < p ){
			first = Round.Hand.PLAYER;
		}else if ( d == p ) {
			die();
		}
	}
	
	public void dieDealDraw() {
		die();
		deal();
		
		int i;
		
		for( i = 0 ; i < MAX ;  i++ ) {
			handcards[first.val()][i] = cards[i];
		}
		
		Util.quickSort(handcards[first.val()], 0, MAX-1);
		pos = i;
		
		for( i = 0 ; i < MAX - 1 ; i++) {
			handcards[first.opponent().val()][i] = cards[pos+i];
		}
		
		Util.quickSort(handcards[first.opponent().val()], 0, MAX-2);
		
		pos += i;
	}
	public byte[] getInitHandCards(Round.Hand hand) {
		if(first == hand)
			return handcards[hand.val()];
		byte[] arr = new byte[MAX-1];
		System.arraycopy(handcards[hand.val()], 0, arr, 0, MAX-1);
		return arr;
	}
	
	public byte cards[] = { 
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
	
	public static void sort( byte[] handcards, byte draw ) {
		int i;
		for( i = 0 ; i < MAX - 1 && draw > handcards[i]; i ++ ) ;
		
		int j;
		for( j = MAX - 2 ; j > i ; j --  )
			handcards[j+1] = handcards[j];
		
		handcards[i] = draw;
	}
	
	public static boolean hu( byte[] handcards ){

		return rule1(handcards) || rule2(handcards);
	}
	
	private static boolean rule1( byte[] handcards ) {
		int i;
		for( i = 0 ; i < MAX ; i ++ ) {
			if( handcards[i] !=  handcards[i+1] )
				break;
			i++;
		}
		return i == MAX;
	}
	
	private static boolean rule2( byte[] handcards ) {
		int i;
		for( i = 0 ; i < MAX ; i ++ ) {
			if( handcards[i] !=  handcards[i+1] + 1 &&  handcards[i+1] != handcards[i+2] + 2 )
				break;
			i += 2;
		}
		return i == MAX;
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
