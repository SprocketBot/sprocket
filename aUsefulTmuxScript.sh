#!/bin/zsh

SESSIONNAME="sprocket"
tmux has-session -t $SESSIONNAME &> /dev/null

if [ $? != 0]
	then
		tmux new-session -s $SESSIONNAME -n script -d
		tmux send-keys -t $SESSIONNAME C-b \"
fi

tmux attach -t $SESSIONNAME
