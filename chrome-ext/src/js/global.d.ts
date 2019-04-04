declare namespace chrome {
  namespace extension {
    function getURL(url: string): string
  }

  namespace tabs {
    type Tab = { url: string, id: number}
    function query(obj: object, callback: (tabs: Tab[]) => void): void
    function update(id: any, options: object): void
    function create(options: object): void
  }

  namespace browserAction {
    namespace onClicked {
      function addListener(listener: () => void): void
    }
  }

  namespace runtime {
    type Request = { action: string, payload?: any }
    type Response = { err?: string, body?: any }
    type Callback = (response: Response) => void

    function sendMessage(request: Request, callback: Callback): void

    namespace onMessage {
      type Listener = (request: Request, sender: any, sendResponse: (res: Response) => void) => void
      function addListener(listener: Listener): void
    }
  }
}
