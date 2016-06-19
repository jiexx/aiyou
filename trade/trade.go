import (
	"encoding/json"
    "github.com/ant0ine/go-json-rest/rest"
    "log"
    "net/http"
)

type Order struct {
	time string;
	order_id long;
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
	c_query chan []Order;
	c_order chan Order;
}

func (a *Actor)TradeOver() {
	append(a.dones, Order{time.Now().Format("2006-01-02 15:04:05"), a.orders[0].order_id, a.orders[0].type, a.orders[0].price, a.orders[0].amount});
	a.orders[0].append(a.orders[:0], a.orders[1:]...);
}

func (a *Actor)TradePartial(amount int) {
	append(a.dones, Order{time.Now().Format("2006-01-02 15:04:05"), a.orders[0].order_id, a.orders[0].type, a.orders[0].price, amount});
	a.orders[0].amount = amount;
}



func (a *Actor)Receive(o chan Order, q chan OrderList, QUIT chan int) {
	result := a.dones;
	for {
		select {
		case order := <-o:
			a.mux.Lock();
			a.handle(orders, order);
			a.mux.Unlock();
		case q <- result:
			result = a.dones;
		case <-QUIT:
			fmt.Println("Quit!")
			return
		//default:
		//	fmt.Println("    .")
		//	time.Sleep(50 * time.Millisecond)
		}
	}
}

type Trade struct {
	time string;
	price float64;
	amount int;
}

type Agent struct {
	dones Trade[];
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
			a.dones.append(Order{time.Now().Format("2006-01-02 15:04:05"), price, -amount});
			a.buyer.TradeOver();
			a.seller.TradePartial(a.buyer.orders[0].amount);
		}else if amount > 0 {
			a.dones.append(Order{time.Now().Format("2006-01-02 15:04:05"), price, amount});
			a.buyer.TradePartial(a.seller.orders[0].amount);
			a.seller.TradeOver();
		}else {
			a.dones.append(Order{time.Now().Format("2006-01-02 15:04:05"), price, a.buyer.orders[0].amount});
			a.buyer.TradeOver();
			a.seller.TradeOver();
		}
		a.marketPrice = a.buyer.orders[0].price;
	}
}

func (a *Agent)Deal(q chan Trade, QUIT chan int) {
	tick := time.Tick(100 * time.Millisecond);
	result := a.dones;
	for {
		select {
		case <-tick:
			a.seller.mux.Lock();
			a.buyer.mux.Lock();
			a.Trade();			
			a.buyer.mux.Unlock();
			a.seller.mux.Unlock();
		case q <- result:
			result = a.dones;
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
	go a.buyer.Receivea.buyer.c_order, a.buyer.c_query, a.c_quit);
	
	return a;
}
var agent Agent;
func main() {
	
	agent := makeAgent();
	
    api := rest.NewApi()
    api.Use(rest.DefaultDevStack...)
    router, err := rest.MakeRouter(
        rest.Get("/order/:code", MakeOrder),
    )
    if err != nil {
        log.Fatal(err)
    }
    api.SetApp(router)
    log.Fatal(http.ListenAndServe(":8080", api.MakeHandler()))
}
type OrderRequest {
	symbol string;
	type string;
	price float64;
	amount int;
}
var lock = sync.RWMutex{}
func MakeOrder(w rest.ResponseWriter, r *rest.Request) {
    code := r.PathParam("code")

    lock.RLock()
    decoder := json.NewDecoder(r.Body)
    var order_req OrderRequest   
    err := decoder.Decode(&order_req)
    if err != nil {
        panic()
    }
	pri := order_req.price;
	if string.contains(order_req.symbol, "market") {
		pri := agent.marketPrice;
	}
    if string.contains(order_req.symbol, "buy") {
		o := Order{	time:time.Now().Format("2006-01-02 15:04:05"), 1, type:pri, price:, status:""};
		agent.buyer.c_order <- o;
	}else if string.contains(order_req.symbol, "sell") {
		o := Order{	time:time.Now().Format("2006-01-02 15:04:05"), 1, type:pri, price:order_req.price, status:""};
		agent.seller.c_order <- o;
	}
    lock.RUnlock()

    w.WriteJson(country)
}