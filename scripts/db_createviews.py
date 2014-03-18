#!/usr/bin/env python

import json, subprocess as sp, os, sys
from pprint import pprint, pformat

# Set globals
COUCH_SERVER='cs.cloudant.com'
COUCH_DB='news'
with open('local_config.json','r') as f:
    localConfig=json.load(f)
    with open(localConfig['CLOUDANT_PW_FILE'], 'r') as f2:
        tmp=json.load(f2)
        COUCH_UN=tmp['COUCH_UN']
        COUCH_PW=tmp['COUCH_PW']

COUCH_FULLPATH='https://{0}:{1}@{2}/{3}'.format(COUCH_UN, COUCH_PW, COUCH_SERVER, COUCH_DB)


"""
This uses couchapp to manage views http://couchapp.org
http://couchapp.org/page/couchapp-us
In essence:
    couchapp clone https://UN:PW@cs.cloudant.com/news
    # Creates a directory structure with all the view data
    # Simply manipulate that data (and save in source control) then do the following to update
    couchapp push https://UN:PW@cs.cloudant.com/news
"""

def setView():
    cmd=['couchapp', 'push', COUCH_FULLPATH]
    wd= os.path.join(os.path.dirname(os.path.realpath(__file__)), 'couch_design')

    print ('Going to do: {0} in cwd: {1}'.format(' '.join(cmd), wd))
    sp.check_call(cmd, cwd=wd)

def main():
    setView()

if __name__=='__main__':
    main()