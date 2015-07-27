package com.jiexx.aiyou.fsm;

import java.util.LinkedHashMap;
import java.util.Map;

import com.google.gson.Gson;
import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.service.Round;

public abstract class State {
	protected static Gson gson = new Gson();
	private Map<Integer, State> transitions = new LinkedHashMap<Integer, State>();
	private State child = null;
	private State parent = null;
	private Round round = null;
	
	public State(State root) {
		parent = root;
	}
	
	public State getParent() {
		return parent;
	}
	
	public void setRound(Round r) {
		round = r;
	}
	
	public Round getRound() {
		State that = this;
		Round r;
		while( (r = that.round) == null ) 
			that = that.parent;
		return r;
	}
	public void Exit(final Message msg){
		
	}
	
	public abstract void Enter(final Message msg);
	
	public void addTransition(Command cmd, State state) {
		transitions.put(cmd.val(), state);
	}
	public void next(Message msg) {
		Exit(msg);
		
		if( child != null ) {
			child.next(msg);
		}
		
		State state = transitions.get(msg.cmd);
		
		state.Enter(msg);
		
		parent.child = state;
	}
	public void setInitState(State state){
		child = state;
		state.parent = this;
	}
}
