#!/bin/zsh

SESSIONNAME="sprocket"
tmux has-session -t $SESSIONNAME &> /dev/null

if [ $? != 0 ]
	then
		tmux new-session -s $SESSIONNAME -n script -d
		tmux split-window -h
		tmux selectp -t 0
		tmux send-keys 'npm run build --workspaces --if-present' C-m
		tmux split-window -v
		tmux selectp -t 1
		tmux send-keys 'cd $PWD/core' C-m
		tmux send-keys 'sleep 120; npm run dev;' C-m
		tmux selectp -t 2
		tmux send-keys 'cd $PWD/clients/web' C-m 'reset' C-m
		tmux send-keys 'export PUBLIC_GQL_URL=http://localhost:3001; sleep 240; npm run dev' C-m
		tmux split-window -v
		tmux selectp -t 3
		tmux send-keys 'cd $PWD/common' C-m 'reset' C-m
		tmux selectp -t 0
fi

tmux attach -t $SESSIONNAME
