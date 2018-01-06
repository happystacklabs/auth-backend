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
task1() {
  nsp audit-shrinkwrap
  nsp check
}
tasks[0]='Security scan'
tasksCommand[0]=task1


################################################################################
# Task 1
################################################################################
tasks[1]='Deploy Heroku'
tasksCommand[1]='git push heroku master'


################################################################################
# Task 3
################################################################################
# tasks[2]='Task three'
# tasksCommand[2]='sleep 5.0'
