//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
package search

import (
	"log"
	"os/exec"
	"encoding/json"
	"net/http"
	"reflect"
	"fmt"
	"bytes"
	"strings"
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
)

type DB struct {
	_db 
}


func (this *user) getDB() DB {
	DB, _ := sql.Open("mysql", "user:password@/dbname")
}

