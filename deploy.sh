#!/usr/bin/env bash
# The MIT License (MIT)
# Copyright (c) Happystack


# shellcheck disable=SC2034
tasks=()
tasksCommand=()


# Do not change content before here.
#
# How to use
# ----------
# To add a new task, add the task title and the command.
#
# tasks[n]='Task title'
# tasksCommand[n]='the bash command'
#
# where 'n' is the index of the task
#
#
################################################################################
# Your custom content for the display, title and subtitle
################################################################################
currentVersion=$(grep -m1 version package.json | awk -F: '{ print $2 }' | sed 's/[", ]//g')
display="Current Version: ${currentVersion}"
title='Happystack Auth Backend'
subtitle='Deploy'


###############################################################################
# Task 1
###############################################################################

tasks[0]='Testing suite'
tasksCommand[0]='npm run ci'


###############################################################################
# Task 2
###############################################################################
tasks[1]='Run linter'
tasksCommand[1]='npm run lint'


################################################################################
# Task 3
################################################################################
task3() {
  nsp check
  snyk test
}
tasks[2]='Security scan'
tasksCommand[2]=task3


################################################################################
# Task 4
################################################################################
tasks[3]='Run build'
tasksCommand[3]='npm run build'


################################################################################
# Task 5
################################################################################
tasks[4]='Deploy Heroku'
tasksCommand[4]='cd ./build && git push heroku master'
