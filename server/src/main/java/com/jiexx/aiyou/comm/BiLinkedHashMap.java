package com.jiexx.aiyou.comm;

import java.util.HashMap;

public class BiLinkedHashMap<K,V> {
	public class Value {
		public long time;
		public K key;
		public V value;
		private Value next;
		private Value prev;
		Value(K key, V value) {
			this.key = key;
			this.value = value;
			this.time = System.currentTimeMillis();
		}
	};
	private Value head = null;
	private HashMap<K, Value> lhm = null;
	
	public BiLinkedHashMap() {
		lhm = new HashMap<K, Value>();
	}
	
	public void put(K key, V value) {
		if( head == null ) {
			head = new Value(key, value);
			head.prev = head;
			head.next = head;
			lhm.put(key, head);
		}else {
			Value last = new Value(key, value);
			last.next = head;
			last.prev = head.prev;
			if( lhm.put(key, head) != null ) {
				head.prev.next = last;
				head.prev = last;
			}
		}
	}
	
	public void remove(K key) {
		if( head != null ) {
			Value curr = lhm.get(key);
			if( curr == head ) {
				if( head == head.next ){
					head = null;
				}else {
					head = head.next;
				}
			}
			curr.prev.next = curr.next;
			curr.next.prev = curr.prev;
			curr.prev = null;
			curr.next = null;
			lhm.remove(key);
			curr = null;
		}
	}
	
	public Value getHead() {
		return head;
	}
	
	public Value get(K key) {
		return lhm.get(key);
	}
	
	public boolean containsKey(K key) {
		return lhm.containsKey(key);
	}
	
	public void refresh(int interval) {
		long time = System.currentTimeMillis();
		Value curr = head;
		while( curr.next != head ) {
			if( time - curr.time >= interval ) {
				remove( curr.key );
			}
			curr = curr.next;
		}
		if( time - curr.time >= interval ) {
			remove( curr.key );
		}
	}
}
