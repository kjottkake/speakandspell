const Error = ({err}) => {
    return <div className="flex flex-col">
        <div>{err.status}</div>
        <div>{err.statusText}</div>
    </div>
}

export default Error;
