import (
	"encoding/json"
    "github.com/ant0ine/go-json-rest/rest"
    "log"
    "net/http"
	"io"
	"golang.org/x/net/websocket"
)

type Order struct {
	time string;
	order_id uint64;
	type string;
	price float64;
	amount int;
	status string;
}

type SellOrders []Order;
type BuyOrders []Order;

func (a *BuyOrders) handle(o Order) {
	for i := 0 ; i < len(a) ; i ++ {
		if o.price > a[i].price {
			a = append(a[:i], append(o,a[i:]...)...)
		}
	}
}

func (a *SellOrders) handle(o Order) {
	for i := 0 ; i < len(a) ; i ++ {
		if o.price <= a[i].price {
			a = append(a[:i], append(o,a[i:]...)...)
		}
	}
}

type Hander interface {
	handle(o Order);
}

type Actor struct {
	Agent* agent;
	orders []Order;
	dones []Order;
	handler Hander;
	mux Sync.Mux;
	c_query chan Order;
	c_order chan Order;
}

func (a *Actor)TradeOver() {
	append(a.dones, Order{time.Now().Format("2006-01-02 15:04:05"), a.orders[0].order_id, a.orders[0].type, a.orders[0].price, a.orders[0].amount});
	a.orders = append(a.orders[:0], a.orders[1:]...);
}

func (a *Actor)TradePartial(amount int) {
	append(a.dones, Order{time.Now().Format("2006-01-02 15:04:05"), a.orders[0].order_id, a.orders[0].type, a.orders[0].price, amount});
	a.orders[0].amount = amount;
}



func (a *Actor)Receive(o chan Order, q chan OrderList, QUIT chan int) {
	var result Order;
	for {
		select {
		case order := <-o:
			a.mux.Lock();
			a.handle(orders, order);
			a.mux.Unlock();
		case q <- result:
			result = a.dones[0];
		case <-QUIT:
			fmt.Println("Quit!")
			return
		//default:
		//	fmt.Println("    .")
		//	time.Sleep(50 * time.Millisecond)
		}
	}
}

func (a *Actor)Cancel(id unit64) boolean {
	a.mux.Lock();
	i := 0;
	result := false;
	for  ; i < len(a) ; i ++ {
		if o.order_id == id {
			result = true;
			break;
		}
	}
	a.orders = append(a[:i], append(o,a[i:]...)...);
	a.mux.Unlock();
	return result;
}

func (a *Actor)Print() [20]Order {
	var result [20]Order;
	lenOrders := len(a.orders);
	a.mux.Lock();
	if lenOrders >= 20 {
		for i := 0 ; i < 20 ; i ++ {
			result[i] = a.orders[i];
		}
	}else {
		for i := 0 ; i < lenOrders ; i ++ {
			result[i] = a.orders[i];
		}
		for i := lenOrders ; i < 20 ; i ++ {
			result[i] = Order{};
		}
	}
	a.mux.Unlock();
	return result;
}

type Trade struct {
	time string `json:"time"`;
	buy_id uint64 `json:"buy_id"`;
	sell_id uint64 `json:"sell_id"`;
	price float64 `json:"price"`;
	amount int `json:"amount"`;
}

type Agent struct {
	dones []Trade;
	marketPrice float64;
	seller Actor;
	buyer Actor;
	c_query chan Trade;
	c_quit chan int;
}

func (a *Agent)Trade() {
	if a.buyer.orders[0] != nil && a.seller.orders[0] != nil && a.buyer.orders[0].price >= a.seller.orders[0].price {
		var amount =  a.buyer.orders[0].amount - a.seller.orders[0].amount;
		if amount < 0 {
			a.dones.append(Order{time.Now().Format("2006-01-02 15:04:05"), a.buyer.orders[0].order_id, a.seller.orders[0].order_id, a.buyer.orders[0].price, a.buyer.orders[0].amount});
			a.buyer.TradeOver();
			a.seller.TradePartial(a.buyer.orders[0].amount);
		}else if amount > 0 {
			a.dones.append(Order{time.Now().Format("2006-01-02 15:04:05"), a.buyer.orders[0].order_id, a.seller.orders[0].order_id, a.seller.orders[0].price, a.seller.orders[0].amount});
			a.buyer.TradePartial(a.seller.orders[0].amount);
			a.seller.TradeOver();
		}else {
			a.dones.append(Order{time.Now().Format("2006-01-02 15:04:05"), a.buyer.orders[0].order_id, a.seller.orders[0].order_id, a.seller.orders[0].price, a.seller.orders[0].amount});
			a.buyer.TradeOver();
			a.seller.TradeOver();
		}
		a.marketPrice = a.buyer.orders[0].price;
	}
}

func (a *Agent)Deal(q chan Trade, QUIT chan int) {
	tick := time.Tick(100 * time.Millisecond);
	var result Trade;
	for {
		select {
		case <-tick:
			a.seller.mux.Lock();
			a.buyer.mux.Lock();
			a.Trade();			
			a.buyer.mux.Unlock();
			a.seller.mux.Unlock();
		case q <- result:
			result = a.dones[0];
		case <-QUIT:
			fmt.Println("Quit!")
			return
		//default:
		//	fmt.Println("    .")
		//	time.Sleep(50 * time.Millisecond)
		}
	}
}
func makeAgent() Agent {
	a := Agent{marketPrice:100.0, c_query:make(chan Trade), c_quit:make(chan int)};
	a.seller := Actor{agent:a, handle:&SellOrders{}, c_query:make(chan OrderList), c_order:make(chan Order)};
	a.buyer := Actor{agent:a, handle:&BuyOrders{}, c_query:make(chan OrderList), c_order:make(chan Order)};
	
	go a.Deal(a.c_query, a.c_quit);
	go a.seller.Receive(a.seller.c_order, a.seller.c_query, a.c_quit);
	go a.buyer.Receive(a.buyer.c_order, a.buyer.c_query, a.c_quit);
	
	return a;
}
var agent Agent;
var lock = sync.RWMutex{};
var global_id uint64{0};
var conn []*websocket.Conn;
type Log struct {
	price string `json:"marketPrice"`;
	trade Trade `json:"trade"`;
	order Order `json:"order"`;
}
func echoHandler(ws *websocket.Conn) {
	defer func() {
		ws.Close()
	}();
	conn = append(conn, ws);
	for {
		select {
		case o := <- agent.c_query:
			fmt.Println("Send:", o)
			for i, c := range conn {
				log := Log{price:agent.marketPrice, trade:o};
				//str := fmt.Sprint(o);
				//err := c.Write(str);
				err != websocket.JSON.Send(c.ws, log);
				if err != nil {
					fmt.Println("Sender Closing", err);
					conn = append(conn[:i],conn[i:]...);
				}
			}
		case s := <- agent.seller.c_query:
			fmt.Println("Send:", s);
			for i, c := range conn {
				log := Log{order:s};
				err != websocket.JSON.Send(c.ws, log);
				if err != nil {
					fmt.Println("Sender Closing", err);
					conn = append(conn[:i],conn[i:]...);
				}
			}
		case b := <- agent.buyer.c_query:
			fmt.Println("Send:", b);
			for i, c := range conn {
				log := Log{order:b};
				err != websocket.JSON.Send(c.ws, log);
				if err != nil {
					fmt.Println("Sender Closing", err);
					conn = append(conn[:i],conn[i:]...);
				}
			}
		case <-agent.c_quit:
			fmt.Println("Quit!");
			return;
		}
	}
}

func main() {
	
	agent := makeAgent();
	
    api := rest.NewApi()
    api.Use(rest.DefaultDevStack...)
    router, err := rest.MakeRouter(
        rest.Get("/order/", MakeOrder),
		//rest.Get("/cancel/:id", CancelOrder),
		rest.Get("/cancel", CancelOrder),
    )
    if err != nil {
        log.Fatal(err)
    }
    api.SetApp(router)
	http.Handle("/", http.FileServer(http.Dir("./test")));
    log.Fatal(http.ListenAndServe(":8080", api.MakeHandler()))
	
	go func() {
		http.Handle("/echo", websocket.Handler(echoHandler))
		log.Fatal(http.ListenAndServe(":8081", nil));
	}()
	
}
type OrderRequest {
	symbol string;
	type string;
	price float64;
	amount int;
}
type OrderResponse {
	result boolean;
	order_id int;
	type string;
}

func MakeOrder(w rest.ResponseWriter, r *rest.Request) {
    lock.RLock()
	
    decoder := json.NewDecoder(r.Body)
    var order_req OrderRequest   
    err := decoder.Decode(&order_req)
    if err != nil {
        panic()
    }
	pri := order_req.price;
	result := false;
	if string.contains(order_req.type, "market") {
		pri := agent.marketPrice;
	}
    if string.contains(order_req.type, "buy") {
		if pri <= agent.marketPrice * 1.1 {
			o := Order{	time:time.Now().Format("2006-01-02 15:04:05"), global_id, type:order_req.type, price:pri, status:""};
			agent.buyer.c_order <- o;
			result = true;
		}
	}else if string.contains(order_req.type, "sell") {
		if pri >= agent.marketPrice * 0.9 {
			o := Order{	time:time.Now().Format("2006-01-02 15:04:05"), global_id, type:order_req.type, price:pri, status:""};
			agent.seller.c_order <- o;
			result = true;
		}
	}
	global_id ++;
    lock.RUnlock()
	
    w.WriteJson(OrderResponse{result, order_req.type, global_id});
}
type CancleRequest {
	symbol string;
	type string;
	order_id int;
}
func CancelOrder(w rest.ResponseWriter, r *rest.Request) {
    //code := r.PathParam("code")

    lock.RLock()
	
    decoder := json.NewDecoder(r.Body)
    var order_req CancleRequest   
    err := decoder.Decode(&order_req)
    if err != nil {
        panic()
    }
	result := false;
	if string.contains(order_req.type, "buy") {
		result = agent.buyer.Cancel(order_req.order_id);
	}else if string.contains(order_req.type, "sell") {
		result = agent.seller.Cancel(order_req.order_id);
	}
    lock.RUnlock()
	
    w.WriteJson(OrderResponse{result, order_req.type, order_req.order_id}); 
}
func DepthOrder(w rest.ResponseWriter, r *rest.Request) {
    //code := r.PathParam("code")
	var d = []Order;
    lock.RLock()
	append(d, agent.buyer.Print());
	append(d, agent.seller.Print());
    lock.RUnlock()
	
    w.WriteJson(d); 
}
