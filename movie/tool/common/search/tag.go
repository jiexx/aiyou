//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
package search

import (
	"bytes"
	"strconv"
	"regexp"
)

type tag struct {
	expr string
	repeated bool
	trace page
	property string
	id string
	result string
}

func (this *tag) String() string {
	var buffer bytes.Buffer
	buffer.WriteString("{id:'")
	buffer.WriteString(this.id)
	buffer.WriteString("',expr:'")
	buffer.WriteString(this.expr)
	buffer.WriteString("',repeated:'")
	buffer.WriteString(strconv.FormatBool(this.repeated))
	buffer.WriteString("',property:")
	buffer.WriteString(this.property)
	buffer.WriteString("'}")
	
	return buffer.String()
}

func (this *tag) hasTrace() bool {
	match, _ := regexp.MatchString("([a-z0-9]*)", this.trace.id)
	return this.trace.id != "" && match
}

func (this *tag) getTrace() page {
	return this.trace
}

func (this *tag) createTrace(udb *UDB) []page {
	if this.hasTrace() {
		p := this.trace.createDataTraced(udb)
		if len(p) == 0 {
			p = this.trace.createTagTraced(this.result)
		}
		return p
	}
	return nil
}
