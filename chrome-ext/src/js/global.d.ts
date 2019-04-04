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
    type Callback = (response: any) => void
    function sendMessage(request: any, callback: Callback): void

    namespace onMessage {
      type Listener = (request: any, sender: any, sendResponse: any) => void
      function addListener(listener: Listener): void
    }
  }
}
