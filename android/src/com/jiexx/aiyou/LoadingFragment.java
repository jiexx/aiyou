package com.jiexx.aiyou;

import org.androidannotations.annotations.AfterViews;
import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.EFragment;
import org.androidannotations.annotations.Receiver;
import org.androidannotations.annotations.ViewById;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.app.Activity;
import android.app.Fragment;

@EFragment(R.layout.fragment_loading)
public class LoadingFragment extends Fragment {

	
	@ViewById(R.id.lodingInfo)
    TextView lodingInfo;


	@AfterViews
	void afterViews() {

	}

	@Receiver(actions = "com.jiexx.aiyou.PROGRESS")
	protected void onProgress(@Receiver.Extra("info") String info) {
		lodingInfo.setText(info);
	}

}
