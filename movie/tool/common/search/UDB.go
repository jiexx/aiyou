//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
package search

import (
	"sync"
	//"errors"
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
)

type UDB struct {
	dbname string
	userid string
	jdbc string
}

var _dbs map[string]*UDB = nil
var _dbsonce sync.Once
func _getDBS() map[string]*UDB {
	if _dbs == nil {
		_dbsonce.Do(func() {
			_dbs = make(map[string]*UDB);
		})
	}
	return _dbs
}
func checkErr(err error) {
    if err != nil {
        panic(err)
    }
}
func (this UDB) get(uid string) *UDB  {
	dbs := _getDBS()
	d, ok := dbs[uid]
	if !ok || d == nil {
		cfg := GetConfig()
		db, err := sql.Open("mysql", cfg.mysql_jdbc) //user:password@127.0.0.1/
		if err != nil {
			stmt, err := db.Prepare("CREATE DATABASE "+uid)
			checkErr(err)

			res, err := stmt.Exec()
			checkErr(err)

			affect, err := res.RowsAffected()
			checkErr(err)
			
			db.Close()
			if affect == 0 {
				return nil
			}
			dbs[uid] = &UDB{userid:uid, jdbc:cfg.mysql_jdbc + uid}
			return dbs[uid]
		}
		return nil
	}
	return d
}
func (this *UDB) save(tabname string, p page){
	
}
func (this UDB) saveTask(tabname string, p task) bool{

	return false
}
func (this *UDB) query(tabname string, colname string) []string {
	db, err := sql.Open("mysql", this.jdbc)
	var cols []string
	if err != nil {
		rows, err := db.Query("SELECT " + colname + " FROM  "+tabname)
		checkErr(err)

		for rows.Next() {
			var col string
			err = rows.Scan(&col)
			checkErr(err)
			
			cols = append(cols, col)
		}
		db.Close()
		return cols
	}
	return nil
}

