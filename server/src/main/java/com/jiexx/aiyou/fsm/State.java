package com.jiexx.aiyou.fsm;

import java.util.LinkedHashMap;
import java.util.Map;

import com.google.gson.Gson;
import com.jiexx.aiyou.comm.Util;
import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.Message;

public abstract class State {
	protected static Gson gson = new Gson();
	private Map<Integer, State> transitions = new LinkedHashMap<Integer, State>();
	private State init = null;
	private State child = null;
	private State parent = null;
	private State previous = null;
	
	public State(State r) {
		parent = r;
	}
	
	public State getParent() {
		return parent;
	}
	
	public State getPreviousState() {
		return previous;
	}
	
	public State getRoot() {
		State p = this;
		while( p.parent != null ) 
			p = p.parent;
		return p;
	}
	public void Exit(final Message msg){
		child = init;
		if( child != null ) {
			child.Exit(msg);
			child.reset();
			for( Map.Entry<Integer, State> entry :  child.transitions.entrySet() ) {
				State p = entry.getValue();
				if( p != null ) {
					p.Exit(msg);
					p.reset();
				}
			}
		}
	}
	
	public abstract void Enter(final Message msg);
	
	public abstract void reset();
	
	public void addTransition(Command cmd, State state) {
		transitions.put(cmd.val(), state);
	}
	public void recv(Message msg) {
		if( child != null ) {
			child.next(msg);
		}
	}
	public void next(Message msg) {
		State state = transitions.get(msg.cmd);
		if( state != null ) {
			Util.log(""+msg.uid, "Current :"+this.getClass().getSimpleName()+"<<< Next :"+state.getClass().getSimpleName()+" message received:"+gson.toJson(msg));
			parent.previous = parent.child;
			parent.child = state;
			
			Exit(msg);

			state.Enter(msg);
			
			state.recv(msg);
		}else {
			recv(msg);
		}
	}
	public void restore() {
		child = init;
	}
	public void setInitState(State state){
		init = state;
		child = state;
		state.parent = this;
	}
}
