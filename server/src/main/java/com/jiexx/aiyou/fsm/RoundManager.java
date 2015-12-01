package com.jiexx.aiyou.fsm;

import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import com.jiexx.aiyou.comm.Util;
import com.jiexx.aiyou.service.GameService;

public class RoundManager {
	private static final int  INVALID = 0x0000000f;  
	private static final int  DEALER = 0x0000001f;
	private static final int  PLAYER = 0x0000002f;   
    
	private int id;
	private int chip;
	private long time;
	
	class UserInfo {
		long next;
		int state;
		String stub;
		UserInfo(long userid, int ep){
			this.next = 0;
			this.state = ep;
			this.stub = "/game/"+userid;
		}
		UserInfo(long userid, int ep, long next){
			this.next = next;
			this.state = ep;
			this.stub = "/game/"+userid;
		}
		LinkedList<Byte> getInitCards(Card cards) {
			if(users.get(curr).state == DEALER)
				return cards.getInitHandCards(cards.first);
			return cards.getInitHandCards(cards.second);
		}
		LinkedList<Byte> getCards(Card cards) {
			if(users.get(curr).state == DEALER)
				return cards.getHandCards(cards.first);
			return cards.getHandCards(cards.second);
		}
		LinkedList<Byte> getCards(Long ptr, Card cards) {
			if(users.get(ptr).state == DEALER)
				return cards.getHandCards(cards.first);
			return cards.getHandCards(cards.second);
		}
	}
	public class CardComparator implements Comparator<Byte> {
		@Override
		public int compare(Byte o1, Byte o2) {
			// TODO Auto-generated method stub
			return o2 - o1;
		}
	}
	private Map<Integer, String> transform = new HashMap<Integer, String>();
	private Map<Long, UserInfo> users = new HashMap<Long, UserInfo>();
	private Card cards = null;
	private long token = 0;

	public RoundManager(int id, int chip) {
		this.id = id;
		this.chip =chip;
		this.time = System.currentTimeMillis();
		this.cards = new Card();
		transform.put(DEALER, "/"+id+"/dealer");
		transform.put(PLAYER, "/"+id+"/player");
	}
	
	public boolean isWatingUser(long id){
		if(users.containsKey(id))
			if(users.size() == 1)
				return true;
		return false;
	}
	
	public boolean isExistedUser(long id){
		if(users.containsKey(id))
			return true;
		return false;
	}
	
	public int getChip(){
		return chip;
	}
	
	public int getRoundId(){
		return this.id;
	}
	
	public void finish(){
		Util.log(".", "delete Round "+id);
		GameService.instance.delRound(id);
	}
	
	public void broadcast(String msg) {
		Set<Entry<Long, UserInfo>> sets = users.entrySet(); 
		for (Entry<Long, UserInfo> entry : sets) {
			UserInfo ui = entry.getValue();
			GameService.instance.sendMessage(transform.get(ui.state), msg);
			Util.log(transform.get(ui.state), " "+msg);
		}
	}
	
	public void addUser(long userid) {
		if(users.containsKey(userid))
			return;
		if(token == 0) {
			token = userid;
			users.put(userid, new UserInfo(userid, INVALID));
		}else {
			users.get(token).next = userid;
			users.put(userid, new UserInfo(userid, INVALID, token));
			token = userid;
		}
	}
	
	public void removeUser(long userid) {
		users.remove(userid);
	}
	
	public void step() {
		token = users.get(token).next;
	}
	
	public void playDice() {
		cards.dieDealDraw();
		
		long[] id = new long[users.size()];
		int i = 0;
		Set<Entry<Long, UserInfo>> sets = users.entrySet();  
		for (Entry<Long, UserInfo> entry : sets) {
			id[i++] = entry.getKey();
		}
		users.get(id[cards.first]).state = DEALER;
		users.get(id[cards.second]).state = PLAYER;
		
		token = id[cards.first];
	}
	
	public void notifyBack(String msg) {
		Util.log(transform.get(users.get(token).state), "  "+msg);
		GameService.instance.sendMessage(transform.get(users.get(token).state), msg);
	}
	/*------------------------- for going state, initialize round, only 2 player now------------------------*/
	public void notifyStub(String msg) {
		Util.log(users.get(curr).stub, "  "+msg);
		GameService.instance.sendMessage(users.get(curr).stub, msg);
	}
	public LinkedList<Long> getIdsOfOther() {
		LinkedList<Long> other = new LinkedList<Long>();
		long ptr = curr;
		while(users.get(ptr).next != curr){
			ptr = users.get(ptr).next;
			other.add(ptr);
		}
		return other;
	}
	/*------------------------- for going state, initialize round end.------------------------*/
	/*------------------------- for OPEN/JOIN/DISCARD message handling.------------------------*/
	private long curr;
	public void startLoop() {
		curr = token;
	}
	public boolean nextUser() {
		if(users.get(curr).next != token) {
			curr = users.get(curr).next;
			return true;
		}else {
			return false;
		}
	}
	public boolean isUserDealer() {
		return users.get(curr).state == DEALER;
	}
	public String getUserEndpoint() {
		return transform.get(users.get(curr).state);
	}
	public LinkedList<Byte> getUserCards() {
		return users.get(curr).getInitCards(cards);
	}
	public long getUserId() {
		return curr;
	}
	public boolean whoIsUser() {
		return Card.hu(users.get(curr).getCards(cards));
	}
	public boolean whoIsUser(byte disc) {
		LinkedList<Byte> wc =  new LinkedList<Byte>(users.get(curr).getCards(cards));
		wc.push(disc);
		Collections.sort(wc, new CardComparator());
		return Card.hu(wc);
	}
	public void notifyUser(String msg) {
		Util.log(transform.get(users.get(curr).state), msg);
		GameService.instance.sendMessage(transform.get(users.get(curr).state), msg);
	}
	public LinkedList<LinkedList<Byte>> getCardsOfOther() {
		LinkedList<LinkedList<Byte>> other = new LinkedList<LinkedList<Byte>>();
		long ptr = curr;
		while(users.get(ptr).next != curr){
			ptr = users.get(ptr).next;
			other.add(new LinkedList<Byte>(users.get(ptr).getCards(ptr, cards)));
		}
		return other;
	}
	public void discard(byte card) {
		LinkedList<Byte> handcards = users.get(curr).getCards(cards);
		String debug = handcards.toString();
		handcards.remove(handcards.indexOf(card));
		Util.log(users.get(curr).stub, "discard "+card+" in: "+debug+ " to:" +users.get(curr).getCards(cards));
	}
	/*------------------------- for OPEN/JOIN/DISCARD message handling end.------------------------*/
	/*------------------------- for PONG/CI/DRAW message handling.------------------------*/
	public void draw(byte card) {
		LinkedList<Byte> handcards = users.get(curr).getCards(cards);
		String debug = handcards.toString();
		
		Util.insert(handcards, card);
		
		Util.log(users.get(curr).stub, "draw "+card+" in: "+debug+ " to:" +users.get(curr).getCards(cards));
	}
	public boolean pong(byte card) {
		LinkedList<Byte> handcards = users.get(token).getCards(cards);
		int pos = Util.findBytes(handcards,  card);
		if(pos > -1 && card == handcards.get(pos) && card == handcards.get(pos+1)) {
			draw(card);
			return true;
		}
		return false;
	}
	public boolean ci(byte disc, byte card1, byte card2) {
		LinkedList<Byte> handcards = users.get(token).getCards(cards);
		int pos1 = Util.findBytes(handcards,  card1);
		int pos2 = Util.findBytes(handcards,  card2);
		if(pos1 > -1 && pos2 > -1) {
			if((disc + card1 + card2) % 3 == 0) {
				draw(disc);
				return true;
			}
		}
		return false;
	}
	/*------------------------- for PONG/CI/DRAW message handling end.------------------------*/
	public void punishOrReward(long punishUserId) {
		GameService.instance.punish(punishUserId, this.chip);
		float chip = (float)this.chip / users.size();
		Set<Entry<Long, UserInfo>> sets = users.entrySet();  
		for (Entry<Long, UserInfo> entry : sets) {
			GameService.instance.reward(entry.getKey(), chip);
		}
	}
	
	public boolean isDeal() {
		return cards.cards.length >= cards.pos;  //tbd
	}
	
	public byte deal() {
		return cards.cards[++cards.pos];  //tbd
	}
}
