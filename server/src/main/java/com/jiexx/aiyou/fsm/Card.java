package com.jiexx.aiyou.fsm;

import java.util.LinkedList;
import java.util.List;
import java.util.Random;

public class Card {	
	public final static char east		= 1;
	public final static char west		= 2;
	public final static char south		= 3;
	public final static char north		= 4;
	public final static char zhong		= 5;
	public final static char fa			= 6;
	public final static char bai		= 7;
	
	public final static char dot1		= 16;
	public final static char dot2		= 17;
	public final static char dot3		= 18;
	public final static char dot4		= 19;
	public final static char dot5		= 20;
	public final static char dot6		= 21;
	public final static char dot7		= 22;
	public final static char dot8		= 23;
	public final static char dot9		= 24;
	
	public final static char Bamboo1	= 25;
	public final static char Bamboo2	= 26;
	public final static char Bamboo3	= 27;
	public final static char Bamboo4	= 28;
	public final static char Bamboo5	= 29;
	public final static char Bamboo6	= 30;
	public final static char Bamboo7	= 31;
	public final static char Bamboo8	= 32;
	public final static char Bamboo9	= 33;
	
	public final static char Char1		= 34;
	public final static char Char2		= 35;
	public final static char Char3		= 36;
	public final static char Char4		= 37;
	public final static char Char5		= 38;
	public final static char Char6		= 39;
	public final static char Char7		= 40;
	public final static char Char8		= 41;
	public final static char Char9		= 42;
	
	public int dealer, player, pos = 0;
	public void die() {
		Random rand =new Random();
		dealer = rand.nextInt(6);
		player = rand.nextInt(6);
		if( dealer > player ) {
			dealer = 1;  // first draw
			player = 0;
		}else if( dealer < player ){
			dealer = 0;
			player = 1;
		}else if ( dealer == player ) {
			die();
		}
	}
	
	public void dieDealDraw() {
		die();
		deal();
		
		int i;
		
		for( i = 0 ; i < 6 ; i ++ ) {
			handcards[1][i] = cards[4*i];
			handcards[1][i+1] = cards[4*i+1];
		}
		handcards[0][i] = cards[4*i];
		
		for( i = 0 ; i < 6 ; i ++ ) {
			handcards[0][i] = cards[4*i+2];
			handcards[0][i+1] = cards[4*i+3];
		}
		
		pos = 2*6 + 1 + 2*6;
	}
	
	public char cards[] = { 
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
	
	public char handcards[][] = new char[2][13];
	
	
	private boolean exchange(int i, int j) {
		if( i < 136 && j < 136 && i != j) {
			char tmp = cards[i];
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
