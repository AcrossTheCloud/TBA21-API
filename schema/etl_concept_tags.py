#!/usr/bin/env python3

import csv, psycopg2, sys

try:

  conn = psycopg2.connect(dbname='tba21')
  # create a psycopg2 cursor that can execute queries
  cursor = conn.cursor()
  # create a new table with a single column called "name"
  cursor.execute("DROP TABLE tba21.concept_tags;")
  # run a SELECT statement - no data in there, but we can try it
  cursor.execute("""
    CREATE TABLE tba21.concept_tags
    (
      ID bigserial PRIMARY KEY,
      tag_name varchar(128)
    );
  """)
  cursor.execute("ALTER TABLE tba21.concept_tags ADD CONSTRAINT concept_tag_name UNIQUE (tag_name);")
  conn.commit() # <--- makes sure the change is shown in the database

  # for dupe avoidance  
  concept_tags = {} 
  keyword_tags = {}

  cursor.execute("SELECT tag_name from tba21.keyword_tags;")
  conn.commit()
  for row in cursor.fetchall():
    keyword_tags[row[0]] = True
  
  concept_insert_sql = 'INSERT INTO tba21.concept_tags (tag_name) VALUES ' 
  keyword_insert_sql = 'INSERT INTO tba21.keyword_tags (tag_name) VALUES ' 

  with open('tags.csv') as csv_file:
      csv_reader = csv.reader(csv_file, delimiter=',')
      next(csv_reader) # skip first line = header
      for row in csv_reader:
        concept_tag = row[0].lstrip().rstrip() # kill any whitespace
        if concept_tag not in concept_tags and concept_tag != '': # something new
          concept_insert_sql += "('" + concept_tag +"')" + ','
          concept_tags[concept_tag] = True

        keyword_tag = row[1].lstrip().rstrip() # kill any whitespace
        if keyword_tag not in keyword_tags and keyword_tag != '': # something new
          keyword_insert_sql += "('" + keyword_tag +"')" + ','
          keyword_tags[keyword_tag] = True

  concept_insert_sql = concept_insert_sql[:-1] + ';' # remove last ',' and add ';'
  keyword_insert_sql = keyword_insert_sql[:-1] + ';' 

  cursor.execute(concept_insert_sql)
  cursor.execute(keyword_insert_sql)

  conn.commit()
  conn.close()

except Exception as e:
  print(e)
