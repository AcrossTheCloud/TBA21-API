#!/usr/bin/env python3

# initial SQL
print('DROP TABLE tba21.concept_tags;')
print("""
  CREATE TABLE tba21.concept_tags
  (
    ID bigserial PRIMARY KEY,
    tag_name varchar(128)
  );
""")
print('ALTER TABLE tba21.concept_tags ADD CONSTRAINT concept_tag_name UNIQUE (tag_name);')

import csv

tags = {} # for dupe avoidance
sql = 'INSERT INTO tba21.concept_tags (tag_name) VALUES ' 

with open('concept_tags.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    next(csv_reader) # skip first line = header
    for row in csv_reader:
      tag = row[0].lstrip().rstrip() # kill any white space
      if tag not in tags: # something new
        sql += "('" + tag +"')" + ','
        tags[tag] = True

sql = sql[:-1] + ';' # remove last ',' and add ';'

print(sql)

