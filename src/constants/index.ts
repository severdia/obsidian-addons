export const openInDefaultIndicatorStyle = `
.internal-embed::after {
    content: "";
    display: block;
    position: absolute;
    margin-top: 5px;
    background: var(--background-secondary);
    background-image: url(data:image/svg+xml,%3Csvg%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20viewBox%3D%220%200%20640%20640%22%3E%0A%20%20%3Cdefs%3E%0A%20%20%20%20%3Cstyle%3E%20.st0%20%7B%20fill%3A%20%23006ef5%3B%20%7D%3C%2Fstyle%3E%0A%20%20%3C%2Fdefs%3E%0A%20%20%3Cpath%20class%3D%22st0%22%20d%3D%22M376%2C64c-9.7%2C0-18.5%2C5.8-22.2%2C14.8-3.7%2C9-1.6%2C19.3%2C5.2%2C26.2l71%2C71-167%2C167c-9.4%2C9.4-9.4%2C24.6%2C0%2C33.9%2C9.4%2C9.3%2C24.6%2C9.4%2C33.9%2C0l167-167%2C71%2C71c6.9%2C6.9%2C17.2%2C8.9%2C26.2%2C5.2%2C9-3.7%2C14.9-12.4%2C14.9-22.1V88c0-13.3-10.7-24-24-24h-176ZM528%2C206.1l-94.1-94.1h94.1v94.1ZM144%2C160c-44.2%2C0-80%2C35.8-80%2C80v256c0%2C44.2%2C35.8%2C80%2C80%2C80h256c44.2%2C0%2C80-35.8%2C80-80v-88c0-13.3-10.7-24-24-24s-24%2C10.7-24%2C24v88c0%2C17.7-14.3%2C32-32%2C32H144c-17.7%2C0-32-14.3-32-32V240c0-17.7%2C14.3-32%2C32-32h88c13.3%2C0%2C24-10.7%2C24-24s-10.7-24-24-24h-88Z%22%2F%3E%0A%3C%2Fsvg%3E);
    background-size: 18px;
    resize: both;
    background-repeat: no-repeat;
    background-position: center;
    color: var(--text-normal);
    border: 1px solid var(--background-modifier-border-hover);
    border-radius: var(--radius-m);
    cursor: pointer;
    width: 30px;
    height: 30px;
    bottom: 0px;
    right: 0px;
}
.internal-embed{
    padding-bottom: 30px;
}

.pdf-container,
.pdf-toolbar {
  border: 1px solid var(--background-modifier-border);
  border-radius: var(--radius-s);
}

.pdf-container {
  border-top: 0px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  margin-bottom: 8px;
}

.pdf-toolbar {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

.internal-embed.pdf-embed {
  border: none;
}
`;
