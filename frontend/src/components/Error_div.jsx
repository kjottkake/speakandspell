const ErrorDiv = ({err}) => {
    if (err) {
        return (
            <div className="text-red-500">
                {err}
            </div>
        );
    }
}

export default ErrorDiv;
